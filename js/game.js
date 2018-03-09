"use strict";

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

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
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
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

var mouse = {
    x:0,
    y: 0,
    down: false,
    init: function(){
        $('#gamecanvas').mousemove(mouse.mousemovehandler);
        $('#gamecanvas').mousedown(mouse.mousedownhandler);
        $('#gamecanvas').mouseup(mouse.mouseuphandler);
        $('#gamecanvas').mouseout(mouse.mouseuphandler);
    },
    mousemovehandler: function(ev) {
        var offset = $('#gamecanvas').offset();
        
        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;
        
        if(mouse.down) {
            mouse.dragging = true;
        }
        
    },
    
    mousedownhandler: function(ev){
        mouse.down = true;
        mouse.downX = mouse.x;
        mouse.downY = mouse.y;
        ev.originalEvent.preventDefault();
    },
    
    mouseuphandler: function(ev){
        mouse.down = false;
        mouse.dragging = false;
    }
    
    
}
var levels = {
    //Nivel de datos
    data:[
        {// First level
           foreground:'desert-foreground',
           background:'clouds-background',
           entities:[
               {type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
               {type:"ground", name:"wood", x:185,y:390,width:30,height:80,isStatic:true},
   
               {type:"block", name:"wood", x:520,y:380,angle:90,width:100,height:25},
               {type:"block", name:"glass", x:520,y:280,angle:90,width:100,height:25},
               {type:"villain", name:"burger",x:520,y:205,calories:590},
   
               {type:"block", name:"wood", x:620,y:380,angle:90,width:100,height:25},
               {type:"block", name:"glass", x:620,y:280,angle:90,width:100,height:25},
               {type:"villain", name:"fries", x:620,y:205,calories:420},
   
               {type:"hero", name:"orange",x:80,y:405},
               {type:"hero", name:"apple",x:140,y:405},
           ]
        },
           {   // Second level
               foreground:'desert-foreground',
               background:'clouds-background',
               entities:[
                   {type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
                   {type:"ground", name:"wood", x:185,y:390,width:30,height:80,isStatic:true},
   
                   {type:"block", name:"wood", x:820,y:380,angle:90,width:100,height:25},
                   {type:"block", name:"wood", x:720,y:380,angle:90,width:100,height:25},
                   {type:"block", name:"wood", x:620,y:380,angle:90,width:100,height:25},
                   {type:"block", name:"glass", x:670,y:317.5,width:100,height:25},
                   {type:"block", name:"glass", x:770,y:317.5,width:100,height:25},
   
                   {type:"block", name:"glass", x:670,y:255,angle:90,width:100,height:25},
                   {type:"block", name:"glass", x:770,y:255,angle:90,width:100,height:25},
                   {type:"block", name:"wood", x:720,y:192.5,width:100,height:25},
   
                   {type:"villain", name:"burger",x:715,y:155,calories:590},
                   {type:"villain", name:"fries",x:670,y:405,calories:420},
                   {type:"villain", name:"sodacan",x:765,y:400,calories:150},
   
                   {type:"hero", name:"strawberry",x:30,y:415},
                   {type:"hero", name:"orange",x:80,y:405},
                   {type:"hero", name:"apple",x:140,y:405},
               ]
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

        //Declarar un nuevo objeto de nivel actual
        box2d.init();
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
        
        //Cargar todas las entidades
        for(var i = level.entities.length -1; i >= 0; i--){
            var entity = level.entities[i];
            entities.create(entity);
        }

        //Llamar a game.start() cuando los assets se hayan cargado
        if(loader.loaded){
            game.start();
        } else {
            loader.onload = game.start;
        }
    }
};

var entities = {
    definitions:{
        "glass":{
			fullHealth:100,
			density:2.4,
			friction:0.4,
			restitution:0.15,
		},
		"wood":{
			fullHealth:500,
			density:0.7,
			friction:0.4,
			restitution:0.4,
		},
		"dirt":{
			density:3.0,
			friction:1.5,
			restitution:0.2,
		},
		"burger":{
			shape:"circle",
			fullHealth:40,
			radius:25,
			density:1,
			friction:0.5,
			restitution:0.4,
		},
		"sodacan":{
			shape:"rectangle",
			fullHealth:80,
			width:40,
			height:60,
			density:1,
			friction:0.5,
			restitution:0.7,
		},
		"fries":{
			shape:"rectangle",
			fullHealth:50,
			width:40,
			height:50,
			density:1,
			friction:0.5,
			restitution:0.6,
		},
		"apple":{
			shape:"circle",
			radius:25,
			density:1.5,
			friction:0.5,
			restitution:0.4,
		},
		"orange":{
			shape:"circle",
			radius:25,
			density:1.5,
			friction:0.5,
			restitution:0.4,
		},
		"strawberry":{
			shape:"circle",
			radius:15,
			density:2.0,
			friction:0.5,
			restitution:0.4,
		},
    },

    create:function(entity){

    },

    draw:function(entity, position, angle){

    }
};

var box2d = {
	scale:30,
	init:function(){
		// Configurar el mundo de box2d que hará la mayoría de los cálculos fisicos
		var gravity = new b2Vec2(0,9.8); 
		var allowSleep = true; //Permitir que los objetos que estám em reposo se queden dormidos y se excluyan de los calculos
		box2d.world = new b2World(gravity,allowSleep);
    },

    createRectangle:function(entity, definition){
        var bodyDef = new b2BodyDef;
        if(entity.isStatic){
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }

        bodyDef.position.x = entity.x/box2d.scale;
        bodyDef.position.y = entity.y/box2d.scale;
        if(entity.angle){
            bodyDef.angle = Math.PI*entity.angle/180;
        }

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;

        fixtureDef.shape = new b2PolygonShape;
        fixtureDef.shape.SetAsBox(entity.width/2/box2d.scale,entity.height/2/box2d.scale);

        var body = box2d.world.CreateBody(bodyDef);
        body.setUserData(entity);

        var fixture = body.CreateFixture(fixtureDef)
        return body;
    },
    createCircle:function(entity,definition){
        var bodyDef = new b2BodyDef;
        if(entity.isStatic){
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }

        bodyDef.position.x = entity.x/box2d.scale;
        bodyDef.position.y = entity.y/box2d.scale;

        if (entity.angle) {
            bodyDef.angle = Math.PI*entity.angle/180;
        }
        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;

        fixtureDef.shape = new b2CircleShape(entity.radius/box2d.scale);

        var body = box2d.world.CreateBody(bodyDef);
        body.SetUserData(entity);

        var fixture = body.CreateFixture(fixtureDef);
        return body;
    },

    //tomar la entidad, crear un cuerpo box2d y añadirlo al mundo
    create:function(entity){
		var definition = entities.definitions[entity.name];
		if(!definition){
			console.log ("Undefined entity name",entity.name);
			return;
		}
		switch(entity.type){
			case "block": // simple rectangles
				entity.health = definition.fullHealth;
				entity.fullHealth = definition.fullHealth;
				entity.shape = "rectangle";
				entity.sprite = loader.loadImage("images/entities/"+entity.name+".png");
				entity.breakSound = game.breakSound[entity.name];
				box2d.createRectangle(entity,definition);
				break;
			case "ground": // simple rectangles
				// No need for health. These are indestructible
				entity.shape = "rectangle";
				// No need for sprites. These won't be drawn at all
				box2d.createRectangle(entity,definition);
				break;
			case "hero":	// simple circles
			case "villain": // can be circles or rectangles
				entity.health = definition.fullHealth;
				entity.fullHealth = definition.fullHealth;
				entity.sprite = loader.loadImage("images/entities/"+entity.name+".png");
				entity.shape = definition.shape;
				entity.bounceSound = game.bounceSound;
				if(definition.shape == "circle"){
					entity.radius = definition.radius;
					box2d.createCircle(entity,definition);
				} else if(definition.shape == "rectangle"){
					entity.width = definition.width;
					entity.height = definition.height;
					box2d.createRectangle(entity,definition);
				}
				break;
			default:
				console.log("Undefined entity type",entity.type);
				break;
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
        mouse.init();
        
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
    
    //Velocidad maxima de panoramizacion por fotograma en pixeles
    maxSpeed:3,
    // Minimo y Maximo desplazamiento panoramico
    minOffset:0,
    maxOffset:300,
    // Desplazamiento de panoramica actual
    offsetLeft:0,
    // La puntuacion del juego
    score:0,
    
    //Desplegar la pantalla para centrarse en newCenter
    panTo: function(newCenter) {
        if(Math.abs(newCenter-game.offsetLeft-game.canvas.width/4)>0 && game.offsetLeft<=game.maxOffset && game.offsetLeft>=game.minOffset){
            var deltaX  = Math.round((newCenter-game.offsetLeft-game.canvas.width/4)/2);
            if(deltaX && Math.abs(deltaX)>game.maxSpeed){
                deltaX = game.maxSpeed*Math.abs(deltaX)/(deltaX);
            }
            game.offsetLeft += deltaX;
        } else{
            return true;
        }
        if(game.offsetLeft < game.minOffset) {
            game.offsetLeft = game.minOffset;
            return true;
        } else if (game.offsetLeft > game.maxOffset) {
            game.offsetLeft = game.maxOffset;
            return true;
        }
        return false;
    },

    handlePanning: function(){
        if(game.mode=="intro"){
            if(game.panTo(700)){
                game.mode = "load-next-hero";   
            }
        }
        
        if(game.mode=="wait-for-firing"){
            if(mouse.dragging){
                game.panTo(mouse.x + game.offsetLeft)   
            } else{
                game.panTo(game.slingshotX);
            }
        }
        
        if (game.mode =="load-next-hero"){
            // TODO:
            // Comprobar si algun villano está vivo, si no, terminar el nivel (exito)
            // Comprobar si quedan más héroes para cargar, si no terminar el nivel (fallo)
            // Cargar el héroe y fijar a modo de espera para disparar
            game.mode = "wait-for-firing";
        }
        
        if(game.mode=="firing"){
            game.panTo(game.slingshotX);
        }
        
        if (game.mode == "fired"){
            //TODO:
            // Hacer una panoramica donde quiera que el heroe se encuentre actualmente
        }
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
