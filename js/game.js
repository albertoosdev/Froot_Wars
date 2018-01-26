$(window).load(function(){
    game.init();
});

var levels = {
    //Nivel de datos
    data:[
        {   //Primer nivel
            foreground:'desert-foregrund',
            background: 'clouds-background',
            entities:[]
        },
        {   // Segundo nivel
            foreground: 'desert-foreground',
            background: 'clouds-background',
            entities: []
        }
    ],
    //Inicializa la panttalla de seleccion de nivel
    init:function(){
        var html = "";
        for(var i=0; i< levels.data.length; i++){
            var level = levels.data[i];
            html += '<input type="button" value"'+(i+1)+'">';
        };
        $('#levelselectedscreen').html(html);
        
        //Establece los controladores de eventos de click de boton para cargar el nivel
        $('#levelselectedscreen inout').click(function(){
            levels.load(this.value-1);
            $$('#levelselectscreen').hide();
        });
    },
    
    //carga todos los datos e imagenes para un nivel especifico
    load:function(number){
        
    }
}

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
    
    showLevelScreen:function(){
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },
}