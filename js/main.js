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
        username: '',
        pass: '',
        page: 'campus',
        valid: 'false',
        utils: 'utils'
    },

    initialize: function () {
        this.on( 'change:valid', this.userValidate, this );
        this.set({'loggedIn': localStorage.getItem('loggedIn')});
        this.set({'username': localStorage.getItem('username')});
        this.set({'pass': localStorage.getItem('pass')}); 
	    this.set({'utils': localStorage.getItem('utils')});
        
        var self = this;
		if( this.get('username') != '' && this.get('username') != null && ether > 0 ){
				  this.fetch({ 
                    data: $.param({ nm: this.get('username'), ps: this.get('pass') }) 
                  }).complete(function(){
                    self.userValidate(self);
                  });
			alert('on ether '+ether);
        }else{
			//self.userValidate(self);
			localStorage.setItem('loggedIn', 'false')
            this.set({'loggedIn': 'false' });
			alert('off ether '+ether);
		}
        
    },

    setUser: function( username, pass ) {
        
        localStorage.setItem('username', username)
        this.set({'username': username});
        localStorage.setItem('pass', pass)
        this.set({'pass': pass});
        
        var self = this;
        
        //this.fetch({ data: $.param({ nm: username, ps: pass}) })
        
        this.fetch({ data: $.param({ nm: username, ps: pass }), success: function() { }});
        
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
            appi.app.render();
        }
    },
    
    url: function() {
        //return "../apk/checkBB.jsp";
		return "http://10.10.10.151:8080/PWmeter/apk/checkBB.jsp";
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
	    'click a.logout': 'logout',
        'click .changeutil': 'changeutil',
        'click .sett': 'sett'
    },
	
    logout: function(e){
        e.preventDefault();
        localStorage.clear();
        this.model.clearLogin();
	    appi.navigate('', true);	
    },
    
    changeutil: function(e){
        console.log('hi');
        if( this.model.get('utils') == 'utils' ){
            this.model.set({'utils': 'util'});
            $('.changeutil').text('util on');
            localStorage.setItem('utils', 'util');
        }else{
            this.model.set({'utils': 'utils'});
            $('.changeutil').text('util off');
            localStorage.setItem('utils', 'utils');
        }
        this.nav.render();
        this.campus.render();
        $(".selected").nextAll().children('a').addClass('hid');
        appi.navigate('campus', true);
    },
    
    sett: function(e){
        if( $('#settings_cont').hasClass('hid') ){
            $('#settings_cont').removeClass('hid');
        }else{
            $('#settings_cont').addClass('hid');
        }
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
        
            var ind = -1;
        
            if( this.model.get('page') == 'campus' ){
                this.nav.collection.at(0).set('selected', 'selected');
				ind = 0;
            }
            else if( this.model.get('page').indexOf('utils/') !== -1 ){
                ind = 1;
                this.nav.collection.at(1).set('selected', 'selected');
            }
            else if( this.model.get('page').indexOf('meters/') !== -1 ){
                ind = 2;
                this.nav.collection.at(2).set('selected', 'selected');
            }
            else if( this.model.get('page').indexOf('meter/') !== -1 ){
                ind = 3;
                this.nav.collection.at(3).set('selected', 'selected');   
            }
			
			if( ind >= 0 ){
            $('h1').html( 
                '<img src="imgs/meter.png" />'+
                this.nav.collection.at(ind).attributes.title );
			}
            
            this.nav.render();
            
            if( ind >= 1 ){
                $('.nav .utils a').attr('href','#utils/'+this.utils.options.constraint);
            }
            if( ind >= 2 ){
                $('.nav .meters a').attr('href','#meters/'+this.meters.options.constraint+"/"+this.meters.options.uconstraint);
            }
            
            $(".selected").nextAll().children('a').addClass('hid');
        
        }
    },
    
    renderView: function () {
        if( this.model.get('page').indexOf('campus') !== -1 ){
            this.campus.render();
        }
        else if( this.model.get('page').indexOf('utils/') !== -1 ){
            this.utils.render();
        }
        else if( this.model.get('page').indexOf('meters/') !== -1 ){
            this.meters.render();
        }
        else if( this.model.get('page').indexOf('meter/') !== -1 ){
            this.meter.render();
        }
    },

    render: function () {
            
        if ( this.model.get('loggedIn') == "true" ) {
            $(this.el).empty().html(this._loggedInTemplate(this.model));

            this.nav = new App.Views.navColl({ collection: nav });
            
            this.renderNav();
            
            if ( this.model.get('valid') == "Success" ) {
                
                appi.navigate( this.model.get('page') , true);
                   
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
                u.getColl( user, pass, 'EXE' );
                //w.getColl( user, pass, 'EXE' );
        }});
        
    },
    
    url: function() {
        //return "../apk/campusCallBB.jsp";
		return "http://10.10.10.151:8080/PWmeter/apk/campusCallBB.jsp";
    }
});
App.Views.campusColl = Backbone.View.extend({
    tagName: 'ul',
    
    initialize: function () {
        $(this.el).addClass('campus_list'); 
        
        //_.bindAll(this, "render");
        
        //Render offline
        //this.render();
        
        // Once the collection is fetched re-render the view
        //this.collection.bind("reset", this.render);
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

//New UTILSSSS
App.Views.utils = Backbone.View.extend({
    tagName: 'li',
    
    _utilsView: _.template($('#utils_view').html()),
    
    initialize: function () { 
    },
    
    render: function(){ 
        //this.$el.html( this.model.get('name') );
        $(this.el).empty().html(this._utilsView(this.model));
        return this;
    }
});
App.Models.utils = Backbone.Model.extend({

    defaults: {
        name: '',
        desc: ''
    }
    
});
App.Collections.utilsColl = Backbone.Collection.extend({
    model: App.Models.utils,
    
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
        //return "../apk/utilityCallBB.jsp";
		return "http://10.10.10.151:8080/PWmeter/apk/utilityCallBB.jsp";
    }
});
App.Views.utilsColl = Backbone.View.extend({
    tagName: 'ul',
    
    initialize: function () {
        $(this.el).addClass('campus_list');       
    },
    
    render: function(){
        this.$el.empty();
        
        var err = 0;
        
        this.collection.each( function(utils){
            if( utils.get('campus') == this.options.constraint ){
                var _UtilsView = new App.Views.utils({model: utils });
                this.$el.append( _UtilsView.render().el );
                err = 1;
            }
        }, this);
        
        if( err == 0 ){
            this.$el.append( "<div class='error'>No Utilities in this Campus</div>" );
        }

        $('.campus_cont').html( this.$el );  
       
        return this;
    }
    
});
var u = new App.Collections.utilsColl([
    { name: '', desc: ''}
]);
// End Utils

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
        
        if( appi.app.model.attributes.utils == "utils" ){
            $(this.el).addClass('utils');
        }else{
            $(this.el).removeClass('utils');
        }
          
        this.collection.each( function(navi){
            if( navi.get('page') != appi.app.model.get('utils') ){
                var _naviView = new App.Views.nav({model: navi });
                this.$el.append( _naviView.render().el );   
            }
        }, this);
        
        $('.nav_cont').html( this.$el ); 
         
        return this;
    }
});
var nav = new App.Collections.navColl([
    { loc: 'Campus List', title: 'Select a Campus', page: 'campus', selected: '' },
    { loc: 'Utility List', title: 'Select a Utility', page: 'utils', selected: '' },
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
        desc: '',
        util: '',
        campus: ''
    }
    
});
App.Collections.metersColl = Backbone.Collection.extend({
    model: App.Models.meters,
    
    initialize: function () {  
        //this.fetch({ data: $.param({ nm: 'administrator', ps: 'airit' }) });
    },
    
    getColl: function( user, pass, camp ) {
        //this.fetch({ data: $.param({ nm: user, ps: pass, camp: camp }) });
        this.fetch({ data: $.param({ nm: user, ps: pass, camp: camp }), success: function() {
                appi.app.renderView();
                $('.loader').addClass('hid');
        }});
    },
    
    url: function() {
        //return "../apk/meterCallBB.jsp";
		return "http://10.10.10.151:8080/PWmeter/apk/meterCallBB.jsp";
    }
});
App.Views.metersColl = Backbone.View.extend({
    tagName: 'ul',
    
    initialize: function () {
        $(this.el).addClass('campus_list'); 
        
        //_.bindAll(this, "render");
        
        //render offline
        //this.render();
        // Once the collection is fetched re-render the view
        //this.collection.bind("reset", this.render);
        //this.collection.on('add', this.addOne, this);
        
    },
    
    render: function(){
        this.$el.empty();
        
        var err = 0;

        this.collection.each( function(meter){
            if( meter.get('campus') == this.options.constraint ){
                var _MetersView;
                if( this.options.uconstraint == '' ){
                    _MetersView = new App.Views.meters({model: meter });
                    this.$el.append( _MetersView.render().el );
                    err = 1;
                }else{
                    if( meter.get('util') == this.options.uconstraint ){
                        _MetersView = new App.Views.meters({model: meter });
                        this.$el.append( _MetersView.render().el );
                        err = 1;
                    }
                }
            }
        }, this);
        
        if( err == 0 ){
            this.$el.append( "<div class='error'>No Meters in this Campus</div>" );
        }
        
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
        
        $('.campus_cont').html( this.$el );
        
        $("#scroller").scroller({ mode: "scroller", display: "inline", theme: "android-ics light", preset: 'date', dateFormat: "yy-mm-dd", 
                monthNamesShort: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] });
        
        
        return this;
    }
});
App.Models.meter = Backbone.Model.extend({

    defaults: {
        name: '',
        util: '',
        campus: '',
        val: ''
    }
    
});
//End attempt

App.Router = Backbone.Router.extend({
    
    initialize: function () {
 
        this.app = new App.Views.AppView({model: new App.Models.LoginStatus() });
        
        var campusV = v;
        this.app.campus = new App.Views.campusColl({ collection: campusV });
        var utilsV = u;
        this.app.utils = new App.Views.utilsColl({ collection: utilsV });
        var metersV = w;
        var id = '';
        this.app.meters = new App.Views.metersColl({ collection: metersV, constraint: id });
        this.app.meter = new App.Views.meter({ model: new App.Models.meter({name: id}) }); 
        
        $('body').html(this.app.el);
        
        //this.app.render();
        
    },
    
    routes: {
        '': 'index',
        'campus': 'campusAll',
        'utils/:id': 'utilsAll',
        'meters/:id': 'metersAll',
        'meters/:id/': 'metersAll',
        'meters/:id/:id2': 'metersAll',
        'meter/:id2/:id': 'meter',
        'in/campus/:id': 'campus',
        'in/campus/:id/*other': 'campus',
        '*other': 'defaults'
    }, 

    index: function() {
        //appi.navigate('campus', true);
        
    },
    
    campusAll: function() {
        this.app.model.set('page','campus');
        if ( this.app.model.get('loggedIn') == "true" ) {  
            //v.getColl( this.app.model.get('username'), this.app.model.get('pass') );
            this.app.campus.render();
        }
        else{
            appi.navigate('', true);
        }
        
    },
    
    utilsAll: function(id) {
        if ( id != "" ) { 
            
            this.app.utils.options.constraint = id ;
            
            this.app.model.set('page','utils/'+id);
            //v.getColl( this.app.model.get('username'), this.app.model.get('pass') );
            this.app.utils.render();
        }
        else{
            appi.navigate('', true);
        }
        
    },
    
    metersAll: function(id, id2) {
        if ( id != "" ) { 
            if( id2 ){
                this.app.meters.options.constraint = id ;
                this.app.meters.options.uconstraint = id2;
                this.app.model.set('page','meters/'+id+'/'+id2);
                this.app.meters.render();
            }else{
                this.app.meters.options.constraint = id ;
                this.app.meters.options.uconstraint = '';

                this.app.model.set('page','meters/'+id);
                //w.getColl( this.app.model.get('username'), this.app.model.get('pass'), id ); 
                //var h = w;
                //this.app.meters = new App.Views.metersColl({ collection: h, constraint: id }); 

                //this.app.meters.collection = id ;
                this.app.meters.render();
            }
        }
        else{
            appi.navigate('', true);
        }
        
    },
    
    meter: function(id2, id) {
        if ( id != "" ) {
            
            this.app.model.set('page','meter/'+id2+'/'+id);
            //this.app.meter = new App.Views.meter({ model: new App.Models.meter({name: id}) }); 
            this.app.meter.model.attributes.name = id ;
            this.app.meter.model.attributes.campus = id2;
            this.app.meters.options.constraint = id2 ;
            this.app.meter.render();
   
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

appi.app.render();

Backbone.history.start();

})();

