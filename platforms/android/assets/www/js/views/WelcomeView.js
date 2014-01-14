var WelcomeView = function (template) {

    this.initialize = function () {
        // Define a div wrapper for the view. The div wrapper is used to attach events.
        this.el = $('<div/>');

        this.el.on("click", '#btn-link', function(event) {
            dropbox.link();
            event.preventDefault();
        });
        
        this.el.on('click', '#btn-back', function(event) {
        	app.showExitConfirm();
        	event.preventDefault();
        });
         
    };

    this.render = function() {
        this.el.html(template());
        return this;
    };

    this.initialize();

};