"use strict";

$(window).load(function () {
    game.init();
});

var levels = {
    //Nivel de datos
    data: [
        {   //Primer nivel
            foreground: 'desert-foregrund',
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
            html += '<input type="button" value"' + (i + 1) + '">';
        }
        $('#levelselectedscreen').html(html);
        
        //Establece los controladores de eventos de click de boton para cargar el nivel
        $('#levelselectedscreen inout').click(function () {
            levels.load(this.value - 1);
            $('#levelselectscreen').hide();
        });
    },
    
    //carga todos los datos e imagenes para un nivel especifico
    load: function (number) {
        
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
            mp3Support = "" !== audio.canPlayType('audio/mpeg');
            oggSupport = "" !== audio.canPlayType('audio/ogg; codecs="vorbis"');
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
        var audio = new Audio();
        audio.src = url + loader.soundFileExtn;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },
    
    itemLoaded: function () {
        loader.loadedCount++;
        $('#loadingmessage').html('Loaded ' + loader.loaderCount + ' of ' + loader.totalCount);
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
        $('.gamestartscreen').show();
        
        //Obtener el controlador para el canvas y el contexto del juego
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');
    },
    
    showLevelScreen: function () {
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    }
};