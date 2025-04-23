// src/App.jsx
import { useEffect, useRef, useState } from "react";
import "./App.css";

import img1 from "./assets/Mirador.jpeg";
import img2 from "./assets/Desierto.jpeg";
import img3 from "./assets/Vikingos.jpeg";
import img4 from "./assets/Slash.jpeg";
import img5 from "./assets/Sudoku.jpeg";

import song1 from "./assets/i_will.mp3";
import song2 from "./assets/mykindofwoman.mp3";
import song3 from "./assets/coldman.mp3";
import song4 from "./assets/Smithereens.mp3";
import song5 from "./assets/Queen.mp3";
import song6 from "./assets/tattoo.mp3";

import cover1 from "./assets/i_will.jpg";
import cover2 from "./assets/mykindofwoman.jpg";
import cover3 from "./assets/coldman.jpg";
import cover4 from "./assets/Smithereens.webp";
import cover5 from "./assets/Queen.jpg";
import cover6 from "./assets/Tattoo.jpg";

const images = [
  { src: img1, alt: "Mirador", description: "Nuestra pequeña aventura al mirador." },
  { src: img2, alt: "Desierto", description: "Nos moríamos del calor jajajaja." },
  { src: img3, alt: "Vikingos", description: "Tú y yo contra el mundo, corazón." },
  { src: img4, alt: "Slash", description: "Parecía Slash, ¿no crees preciosa?" },
  { src: img5, alt: "Sudoku", description: "Eres tan lista <3." },
];

const songs = [
  { title: "I Will", artist: "Mitski", src: song1, cover: cover1 },
  { title: "Mi Kind of Woman", artist: "Mark DeMarco", src: song2, cover: cover2 },
  { title: "Cold Cold Man", artist: "Saint Motel", src: song3, cover: cover3 },
  { title: "Smithereens", artist: "Twenty One Pilots", src: song4, cover: cover4 },
  { title: "Love of My Life", artist: "Queen", src: song5, cover: cover5 },
  { title: "Tattoo", artist: "Rammstein", src: song6, cover: cover6 },
];

function App() {
  const canvasRef = useRef(null);
  const galleryRef = useRef(null);
  const musicRef = useRef(null);
  const fireworksRef = useRef(null);

  const [showWelcome, setShowWelcome] = useState(false);
  const [enableScroll, setEnableScroll] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [availableLetters, setAvailableLetters] = useState([
    "01.txt", "02.txt", "03.txt", "04.txt", "05.txt",
  ]);
  const [currentLetter, setCurrentLetter] = useState("");
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [skipTyping, setSkipTyping] = useState(false);

  const [fireworksStarted, setFireworksStarted] = useState(false);
  const [fireworksDone, setFireworksDone] = useState(false);

  useEffect(() => {
    const audio = musicRef.current;
    if (audio) {
      audio.load();
      audio.play().catch((e) => console.warn("Autoplay error:", e)).then(() => setIsPlaying(true));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Heart {
      constructor(x, y, r, c) {
        this.x = x; this.y = y; this.r = r; this.color = c;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (Math.random() * 0.5 + 0.5) * 3;
      }
      draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.r);
        ctx.bezierCurveTo(this.x - this.r - this.r / 5, this.y + this.r / 1.5,
          this.x - this.r, this.y - this.r,
          this.x, this.y - this.r / 5);
        ctx.bezierCurveTo(this.x + this.r, this.y - this.r,
          this.x + this.r + this.r / 5, this.y + this.r / 1.5,
          this.x, this.y + this.r);
        ctx.fill(); ctx.restore();
      }
      update() {
        this.y -= this.speed; this.x += Math.sin(this.angle) * 1.5;
      }
    }

    const hearts = Array.from({ length: 100 }, () =>
      new Heart(Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 10 + 5,
        `hsl(${Math.random() * 360}, 80%, 70%)`)
    );

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hearts.forEach(h => { h.update(); h.draw(ctx); });
      animId = requestAnimationFrame(animate);
    }
    animate();

    const stopTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      setShowWelcome(true); setEnableScroll(true);
    }, 4000);

    return () => {
      clearTimeout(stopTimer);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    if (!showLetter) return;
    setTypedText("");
    setIsTyping(true);
    let i = 0, timeoutId;
    function typeChar() {
      if (skipTyping) {
        setTypedText(currentLetter || "");
        setIsTyping(false);
        return;
      }
      if (i < (currentLetter || "").length) {
        setTypedText(t => t + (currentLetter[i] || ""));
        i++;
        timeoutId = setTimeout(typeChar, 50);
      } else {
        setIsTyping(false);
      }
    }
    typeChar();
    return () => clearTimeout(timeoutId);
  }, [currentLetter, showLetter, skipTyping]);

  const receiveLetter = () => {
    if (!availableLetters.length) return;
  
    const idx = Math.floor(Math.random() * availableLetters.length);
    const file = availableLetters[idx];
  
    // Actualizamos el estado de availableLetters
    setAvailableLetters(a => a.filter((_, i) => i !== idx));
  
    // Realizamos la solicitud fetch con manejo de errores
    fetch(`/amordemivida/cartas/${file}`)
      .then(response => {
        // Verificamos si la respuesta es exitosa (status 200-299)
        if (!response.ok) {
          throw new Error('Error al cargar la carta');
        }
        return response.text();
      })
      .then(t => {
        // Actualizamos el estado con el texto de la carta
        setCurrentLetter(t || "");
        setSkipTyping(false);
        setShowLetter(true);
      })
      .catch(error => {
        // Manejo de errores si la solicitud falla
        console.error('Hubo un problema con la solicitud:', error);
        // Opcional: podrías establecer algún estado para mostrar un mensaje de error al usuario
      });
  };

  const closeLetter = () => {
    setShowLetter(false);
    setSkipTyping(false);
  };

  const handlePlayPause = idx => {
    const audio = musicRef.current;
    if (currentSongIndex === idx) {
      isPlaying ? audio.pause() : audio.play();
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSongIndex(idx);
      audio.src = songs[idx].src;
      audio.play();
      setIsPlaying(true);
    }
  };

  // Fuegos artificiales
  useEffect(() => {
    if (!fireworksStarted) return;
    const canvas = fireworksRef.current;
    const ctx = canvas.getContext("2d");
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const gravity=0.02;
    const colors=['#e47a9d','#f3a8d1','#ffe6f0','#fff'];
    let rockets=[], particles=[], spawning=true;

    function spawn() {
      rockets.push({
        x: Math.random()*w, y: h,
        targetY: Math.random()*h*0.5+50,
        speed: Math.random()*2+3,
        color: colors[Math.floor(Math.random()*colors.length)]
      });
    }
    function explode(x,y,c) {
      for(let i=0;i<60;i++){
        const t=Math.random()*Math.PI*2;
        const px=16*Math.sin(t)**3;
        const py=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
        particles.push({
          x,y,
          vx:px*0.3*(Math.random()*0.4+0.8),
          vy:-py*0.3*(Math.random()*0.4+0.8),
          r:Math.random()*3+2,
          color:c,
          life:1
        });
      }
    }
    function update() {
      rockets.forEach((r,i)=>{
        r.y-=r.speed;
        if(r.y<=r.targetY){
          explode(r.x,r.y,r.color);
          rockets.splice(i,1);
        }
      });
      particles.forEach((p,i)=>{
        p.vy+=gravity; p.x+=p.vx; p.y+=p.vy;
        p.life-=0.015; p.r*=0.96;
        if(p.life<=0||p.r<0.5) particles.splice(i,1);
      });
    }
    function draw() {
      ctx.fillStyle='rgba(0,0,0,0.2)';
      ctx.fillRect(0,0,w,h);
      rockets.forEach(r=>{
        ctx.beginPath(); ctx.arc(r.x,r.y,2,0,2*Math.PI);
        ctx.fillStyle=r.color; ctx.fill();
      });
      particles.forEach(p=>{
        ctx.globalAlpha=p.life;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,2*Math.PI);
        ctx.fillStyle=p.color; ctx.fill();
      });
      ctx.globalAlpha=1;
    }
    let anim;
    function loop() {
      update(); draw();
      if(spawning||rockets.length||particles.length){
        anim=requestAnimationFrame(loop);
      } else {
        setFireworksDone(true);
      }
    }
    const interval = setInterval(spawn, 150);
    setTimeout(()=>{
      clearInterval(interval);
      spawning=false;
    },10000);
    loop();
    window.addEventListener('resize',()=>{
      w=canvas.width=window.innerWidth;
      h=canvas.height=window.innerHeight;
    });
    return ()=>{
      clearInterval(interval);
      cancelAnimationFrame(anim);
      window.removeEventListener('resize',()=>{});
    };
  }, [fireworksStarted]);

  const scrollToGallery = () => galleryRef.current.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="app-container" style={{overflow: enableScroll?'auto':'hidden',height: enableScroll?'auto':'100vh'}}>
      <canvas ref={canvasRef} className="canvas-fullscreen"/>
      <audio ref={musicRef} autoPlay loop>
        <source src={songs[0].src} type="audio/mpeg"/>Tu navegador no soporta audio.
      </audio>

      {showWelcome && (
        <div className="welcome-text fade-in">
          <h1>Para el amor de mi vida 💖</h1>
          <button onClick={scrollToGallery}>Bienvenida mi Solecito</button>
        </div>
      )}

      {enableScroll && <>
        {/* Galería */}
        <div ref={galleryRef} className="gallery-container">
          <h2>Recuerdos Juntos 💖</h2>
          <div className="gallery-grid">
            {images.map((img,i)=>(
              <div key={i} className="gallery-item" onClick={()=>setSelectedImage(img.src)}>
                <img src={img.src} alt={img.alt}/>
                <div className="overlay">{img.description}</div>
              </div>
            ))}
          </div>
          <button className="see-more-btn">Ver más recuerdos</button>
        </div>
        {/* Música */}
        <div className="music-section">
          <h2>🎶 Canciones que me recuerdan a ti</h2>
          <div className="music-grid">
            {songs.map((s,i)=>(
              <div key={i} className={`music-card ${currentSongIndex===i&&isPlaying?'playing':''}`} onClick={()=>handlePlayPause(i)}>
                <img src={s.cover} alt={s.title} className="cover-image"/>
                <div className="song-info"><h3>{s.title}</h3><p>{s.artist}</p></div>
                <button className="play-button">{currentSongIndex===i&&isPlaying?'⏸️':'▶️'}</button>
              </div>
            ))}
          </div>
        </div>
        {/* Modal imagen */}
        {selectedImage&&<div className="modal" onClick={()=>setSelectedImage(null)}><img src={selectedImage} alt=""/></div>}
        {/* Cartas */}
        <div className="letter-section">
          {!showLetter&&availableLetters.length>0&&(
            <div className="letter-call-to-action">
              <h2>Cartas para mi amor</h2>
              <button className="receive-letter-btn" onClick={receiveLetter}>Recibir carta 💌</button>
            </div>
          )}
          {showLetter&&(
            <div className="letter-overlay">
              <div className="letter-envelope">
                <div className="letter-page">
                  <div className="letter-content">
                    <div className="letter-text">{typedText.split("\n").map((l,i)=><p key={i}>{l}</p>)}</div>
                  </div>
                  {isTyping?
                    <button className="skip-typing-btn" onClick={()=>setSkipTyping(true)}>Mostrar todo</button>:
                    <button className="close-button" onClick={closeLetter}>✖</button>
                  }
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Fuegos artificiales */}
        <div className="fireworks-container">
          {!fireworksStarted&&(
            <button className="start-btn" onClick={()=>setFireworksStarted(true)}>Sorpresa 🎉</button>
          )}
          {fireworksStarted&&<div className="fw-overlay"/>}
          <canvas ref={fireworksRef} className="fireworks-canvas"/>
          {fireworksDone&&(
            <div className="fireworks-message fade-in">
              Así se siente mi corazón cada que te veo mi amor💖💖💖💖💖
            </div>
          )}
        </div>
      </>}

    </div>
  );
}

export default App;
