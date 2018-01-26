$(window).load(function(){
    game.init();
});

var game = {
    //Comienza inicializando los objetos, precargando los assets y mostrando la pantalla de inicio
    init:function(){
        //Inicializa objetos
        levels.init();
        loader.init();
        mouse.init();
        
        //Oculta todas las capas del juego y muestra la pantalla de inicio
        $('.gamelayer').hide();
        $('.gamestartscreen').show();
        
        //Obtener el controlador para el canvas y el contexto del juego
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');
    },
}