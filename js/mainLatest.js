(function() {

window.App = {
	Models: {},
	Collections: {},
	Views: {},
        Vars: {},
	Router: {}
};

App.Models.LoginStatus = Backbone.Model.extend({

    defaults: {
        loggedIn: 'false',
        username: null,
        pass: null,
        page: 'campus',
        valid: 'false'
    },

    initialize: function () {
        this.on( 'change:valid', this.userValidate, this );
        this.set({'loggedIn': localStorage.getItem('loggedIn')});
        this.set({'username': localStorage.getItem('username')});
        this.set({'pass': localStorage.getItem('pass')}); 
	
        var self = this;
	this.fetch({ 
                    data: $.param({ nm: this.get('username'), ps: this.get('pass') }) 
                  }).complete(function(){
                    self.userValidate(self);
                  });
        
        
    },

    setUser: function( username, pass ) {
        
        localStorage.setItem('username', username)
        this.set({'username': username});
        localStorage.setItem('pass', pass)
        this.set({'pass': pass});
        
        var self = this;
        this.fetch({ 
                    data: $.param({ nm: username, ps: pass}) 
                   });
        
    },
	
    userValidate: function( username, pass ) {
        if( this.get('valid') == "Success" ){
            localStorage.setItem('loggedIn', 'true')
            this.set({'loggedIn': 'true' });
            v.getColl( this.get('username'), this.get('pass') );
            
        }else{
            localStorage.setItem('loggedIn', 'false')
            this.set({'loggedIn': 'false' });
            appi.navigate('', true);
        }
    },
    
    url: function() {
        return "../apk/checkBB.jsp";
    },
	
    clearLogin: function() {      
        this.set(this.defaults);
    }

});

App.Views.AppView = Backbone.View.extend({

    _loggedInTemplate: _.template($('#logged_in').html()),
    _notLoggedInTemplate: _.template($('#not_logged_in').html()),

    initialize: function () {
        //this.model.bind('change:loggedIn', this.render, this);
        this.model.bind('change:valid', this.render, this);
        this.model.bind('change:page', this.renderNav, this);
        
    },

    events: {
        'submit .login': 'onLoginSubmit',
	'click a.logout': 'logout'
    },
	
    logout: function(e){
        e.preventDefault();
        localStorage.clear();
        this.model.clearLogin();
	appi.navigate('', true);	
    },

    onLoginSubmit: function(e){
        e.preventDefault();
        this.model.setUser(
			   this.$('input[name=username]').val() , 
                           this.$('input[name=pass]').val()
			  );
    },
    
    renderNav: function () {
        if( this.nav ){
            
            this.nav.collection.each(function(el,i){
                el.set('selected', '');
            });
        
            if( this.model.get('page') == 'campus' ){
                this.nav.collection.at(0).set('selected', 'selected');
            }
            else if( this.model.get('page').indexOf('meters/') !== -1 ){
                this.nav.collection.at(1).set('selected', 'selected');
            }
            else if( this.model.get('page').indexOf('meter/') !== -1 ){
                this.nav.collection.at(2).set('selected', 'selected');   
                //console.log(this.meters.options.constraint);
                //$('.nav .meters a').attr('href','#meters/'+this.meters.options.constraint);
            }
            
            this.nav.render();
        
        }
    },

    render: function () {
            
        if ( this.model.get('loggedIn') == "true" ) {
            $(this.el).empty().html(this._loggedInTemplate(this.model));

            this.nav = new App.Views.navColl({ collection: nav });
            
            this.renderNav();
            
            if ( this.model.get('valid') == "Success" ) {
                //console.log(appi.app.model.get('page'));
                appi.navigate( this.model.get('page') , true);
                
                if( this.model.get('page').indexOf('meter/') !== -1 ){
                    this.meter.render();
                }
                
            }
        } else {
            $("#main_cont").empty();
            $(this.el).empty().html(this._notLoggedInTemplate(this.model));
        }
        
        return this;
    }
});

//New campuses
App.Views.campus = Backbone.View.extend({
    tagName: 'li',
    
    _campusView: _.template($('#campus_view').html()),
    
    initialize: function () { 
    },
    
    render: function(){ 
        //this.$el.html( this.model.get('name') );
        $(this.el).empty().html(this._campusView(this.model));
        return this;
    }
});
App.Models.campus = Backbone.Model.extend({

    defaults: {
        name: '',
        desc: ''
    }
    
});
App.Collections.campusColl = Backbone.Collection.extend({
    model: App.Models.campus,
    
    initialize: function () {  
        //this.fetch({ data: $.param({ nm: 'administrator', ps: 'airit' }) });
    },
    
    getColl: function( user, pass ) {
        //this.fetch({ data: $.param({ nm: user, ps: pass }) });
        this.fetch({ data: $.param({ nm: user, ps: pass }), success: function() {
                w.getColl( user, pass, 'EXE' );
        }});
        
    },
    
    url: function() {
        return "../apk/campusCallBB.jsp";
    }
});
App.Views.campusColl = Backbone.View.extend({
    tagName: 'ul',
    
    initialize: function () {
        $(this.el).addClass('campus_list'); 
        
        _.bindAll(this, "render");
        
        //Render offline
        this.render();
        
        // Once the collection is fetched re-render the view
        this.collection.bind("reset", this.render);
        //this.collection.on('add', this.addOne, this);
        
    },
    
    render: function(){
        this.$el.empty();
        
        this.collection.each( function(campus){
            var _CampusView = new App.Views.campus({model: campus });
            this.$el.append( _CampusView.render().el );
        }, this);

        $('.campus_cont').html( this.$el );  
       
        return this;
    },
    
    addOne: function( campus ) {
        var _CampusView = new App.Views.campus({model: new App.Models.campus() });
        this.$el.append( _CampusView.render().el );
    }
    
});
var v = new App.Collections.campusColl([
    { name: '', desc: ''}
]);
//END NEW

//NAV
App.Views.nav = Backbone.View.extend({
    tagName: 'li',
    
    _navView: _.template($('#nav_view').html()),
    
    initialize: function () { 
    },
    
    render: function(){
        
        //$(this.el).empty().html(this._navView(this.model));
        $(this.el).empty().html(this._navView(this.model));
        $(this.el).addClass(this.model.get('selected')+" "+this.model.get('page'));
        //$(this.el).addClass('hi');
        return this;
    }
});
App.Models.nav = Backbone.Model.extend({

    defaults: {
        loc: '',
        title: '',
        page: '',
        selected : ''
    }
    
});
App.Collections.navColl = Backbone.Collection.extend({
    model: App.Models.nav,
    
    initialize: function () {  
        
    }
});
App.Views.navColl = Backbone.View.extend({
    tagName: 'ul',
    
    initialize: function () {
        $(this.el).addClass('nav'); 
        _.bindAll(this, "render");
        this.collection.bind("reset", this.render);   
    },
    
    render: function(){
        this.$el.empty();
          
        this.collection.each( function(navi){
            var _naviView = new App.Views.nav({model: navi });
            this.$el.append( _naviView.render().el );           
        }, this);
        
        $('.nav_cont').html( this.$el ); 
         
        return this;
    }
});
var nav = new App.Collections.navColl([
    { loc: 'Campus List', title: 'Select a Campus', page: 'campus', selected: '' },
    { loc: 'Meter List', title: 'Select a Meter', page: 'meters', selected: '' },
    { loc: 'Meter', title: 'Edit Meter', page: 'meter', selected: '' }
]);
//END NAV

//Meters all
App.Views.meters = Backbone.View.extend({
    tagName: 'li',
    
    _metersView: _.template($('#meters_view').html()),
    
    initialize: function () { 
    },
    
    render: function(){ 
        //this.$el.html( this.model.get('name') );
        $(this.el).empty().html(this._metersView(this.model));
        return this;
    }
});
App.Models.meters = Backbone.Model.extend({

    defaults: {
        name: '',
        desc: ''
    }
    
});
App.Collections.metersColl = Backbone.Collection.extend({
    model: App.Models.meters,
    
    initialize: function () {  
        //this.fetch({ data: $.param({ nm: 'administrator', ps: 'airit' }) });
    },
    
    getColl: function( user, pass, camp ) {
        this.fetch({ data: $.param({ nm: user, ps: pass, camp: camp }) });
    },
    
    url: function() {
        return "../apk/meterCallBB.jsp";
    }
});
App.Views.metersColl = Backbone.View.extend({
    tagName: 'ul',
    
    initialize: function () {
        $(this.el).addClass('campus_list'); 
        
        _.bindAll(this, "render");
        
        //render offline
        this.render();
        // Once the collection is fetched re-render the view
        this.collection.bind("reset", this.render);
        //this.collection.on('add', this.addOne, this);
        
    },
    
    render: function(){
        this.$el.empty();
          
        this.collection.each( function(meter){
            if( meter.get('campus') == this.options.constraint ){
                var _MetersView = new App.Views.meters({model: meter });
                this.$el.append( _MetersView.render().el );
            }
        }, this);
        
        $('.campus_cont').html( this.$el );  
       
        return this;
    }
    
});
var w = new App.Collections.metersColl([
    { 
        name: '', 
        desc: '',
        util: '',
        campus: ''
    }
]);

//Attempt to show meter page
App.Views.meter = Backbone.View.extend({
  
    _aMeterView: _.template($('#meter_view').html()),
    
    initialize: function () { 
        
        this.render();  

    },
    
    render: function(){ 
        //this.$el.html( this.model.get('name') );
        $(this.el).empty().html(this._aMeterView(this.model));
        
        console.log( '3'); 
        $('.campus_cont').html( this.$el );
        
        $("#scroller").scroller({ mode: "scroller", display: "inline", theme: "android-ics light", preset: 'date', dateFormat: "yy-mm-dd", 
                monthNamesShort: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] });
        
        
        return this;
    }
});
App.Models.meter = Backbone.Model.extend({

    defaults: {
        name: '',
        val: ''
    }
    
});
//End attempt

App.Router = Backbone.Router.extend({
    
    initialize: function () {
        console.log( '1'); 
        this.app = new App.Views.AppView({model: new App.Models.LoginStatus() });  
        $('body').html(this.app.el);    
    },
    
    routes: {
        '': 'index',
        'campus': 'campusAll',
        'meters/:id': 'metersAll',
        'meter/:id': 'meter',
        'in/campus/:id': 'campus',
        'in/campus/:id/*other': 'campus',
        '*other': 'defaults'
    }, 

    index: function() {
        console.log( 'hi there from the index page'); 
    },
    
    campusAll: function() {
        this.app.model.set('page','campus');
        if ( this.app.model.get('loggedIn') == "true" ) {  
            //v.getColl( this.app.model.get('username'), this.app.model.get('pass') );
            var h = v;
            this.app.campus = new App.Views.campusColl({ collection: h });   
        }
        else{
            appi.navigate('', true);
        }
        
    },
    
    metersAll: function(id) {
        if ( id != "" ) { 
            this.app.model.set('page','meters/'+id);
            //w.getColl( this.app.model.get('username'), this.app.model.get('pass'), id );
            //this.app.meters = new App.Views.metersColl({ collection: w }); 
            var h = w;
            this.app.meters = new App.Views.metersColl({ collection: h, constraint: id }); 
        }
        else{
            appi.navigate('', true);
        }
        
    },
    
    meter: function(id) {
        if ( id != "" ) {
            console.log( '2'); 
            this.app.model.set('page','meter/'+id);
            this.app.meter = new App.Views.meter({ model: new App.Models.meter({name: id}) }); 
            
        }
        else{
            appi.navigate('', true);
        }
 
    },


    campus: function(id) {
        console.log( id );
    },

    defaults: function(other) {
        alert('You got lost trying to find ' + other);
        appi.navigate('', true);
    }

});
var appi = new App.Router;
this.appi = appi;

Backbone.history.start();

})();

