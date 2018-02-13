"use strict";

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x){
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element){
            var currTime = new Date().getTime();
            var timeToCall = Math.max(9, 16 - (currTime - lastTime));
            var id = window.setTimeout(function(){ callback(currTime + timeToCall);},
                timeToCall);
            lasTime = currTime + timeToCall;
            return id
        };
    
        if(!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
}());

$(window).load(function () {
    game.init();
});

var levels = {
    //Nivel de datos
    data: [
        {   //Primer nivel
            foreground: 'desert-foreground',
            background: 'clouds-background',
            entities: []
        },
        {   // Segundo nivel
            foreground: 'desert-foreground',
            background: 'clouds-background',
            entities: []
        }
    ],
    //Inicializa la panttalla de seleccion de nivel
    init: function () {
        var html = "";
        var i;
        for (i = 0; i < levels.data.length; i++) {
            var level = levels.data[i];
            html += '<input type="button" value="' + (i + 1) + '">';
        };
        $('#levelselectscreen').html(html);
        
        //Establece los controladores de eventos de click de boton para cargar el nivel
        $('#levelselectscreen input').click(function () {
            levels.load(this.value - 1);
            $('#levelselectscreen').hide();
        });
    },
    
    //carga todos los datos e imagenes para un nivel especifico
    load: function (number) {
        //declarar un nuevo objeto del nivel actual
        game.currentLevel = {number:number,hero:[]};
        game.score=0;
        $('#score').html('Score: ' + game.score);
        var level = levels.data[number];

        //Cargar el fondo, el primer plano y las imagenes de la honda
        game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/"+level.background+".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/"+level.foreground+".png");
        game.slingshotImage = loader.loadImage("images/slingshot.png");
        game.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");

        //Llamar a game.start() cuando los assets se hayan cargado
        if(loader.loaded){
            game.start();
        } else {
            loader.onload = game.start;
        }
    }
};

var loader = {
    loaded: true,
    loadedCount: 0, //Assets que han sido cargados antes
    totalCount: 0, //Numero total de assets que es necesario cargar
    
    init: function () {
        //Comprueba el soporte para sonido
        var mp3Support, oggSupport;
        var audio = document.createElement('audio');
        if (audio.canPlayType) {
            //Actualmente canPlayType() devuelve: "", "maybe" o "probably"
            mp3Support = "" != audio.canPlayType('audio/mpeg');
            oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');
        } else {
            //La etiqueta de audio no es soportada
            mp3Support = false;
            oggSupport = false;
        }
        
        //Comprueba para ogg, mp3 y finalmnente fija soundFileExtn como undefined
        loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
    },
    
    loadImage: function (url) {
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },
    
    soundFileExtn:".ogg",
    loadSound: function (url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src = url + loader.soundFileExtn;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },

    itemLoaded: function () {
        loader.loadedCount++;
        $('#loadingmessage').html('Loaded ' + loader.loadedCount + ' of ' + loader.totalCount);
        if (loader.loadedCount === loader.totalCount) {
            //El loader ha cargado completamente
            loader.loaded = true;
            //Oculta la pantalla de carga
            $('#loadingscreen').hide();
            //Y llama al metodo loader.onLoad si este existe
            if (loader.onload) {
                loader.onload();
                
                loader.onload = undefined;
            }
                
        }
    }

    
};

var game = {
    //Comienza inicializando los objetos, precargando los assets y mostrando la pantalla de inicio
    init: function () {
        //Inicializa objetos
        levels.init();
        loader.init();
        //mouse.init();
        
        //Oculta todas las capas del juego y muestra la pantalla de inicio
        $('.gamelayer').hide();
        $('#gamestartscreen').show();
        
        //Obtener el controlador para el canvas y el contexto del juego
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');
    },
    
    showLevelScreen: function () {
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },

    mode:"intro",
    slingshotX:140,
    slingshotY:280,
    start:function(){
        $('.gamelayer').hide();
        //Mostrar el canvas del juego y la puntuacion
        $('#gamecanvas').show();
        $('#scorescreen').show();

        game.mode = "intro";
        game.offsetLeft = 0;
        game.ended = false;
        game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
    },

    handlePanning: function(){
        game.offsetLeft++;
    },

    animate:function(){
        // Anima el fondo

        game.handlePanning();

        //Anima los personajes

        //Dibuja el fondo con desplazamiento (parallax scrolling)
        game.context.drawImage(game.currentLevel.backgroundImage,game.offsetLeft/4,0,640,480,0,0,640,480);
        game.context.drawImage(game.currentLevel.foregroundImage,game.offsetLeft,0,640,480,0,0,640,480);
        
        // Dibuja la honda

        game.context.drawImage(game.slingshotImage,game.slingshotX-game.offsetLeft,game.slingshotY);
        game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);

        if(!game.ended){
            game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
        }
    }
};