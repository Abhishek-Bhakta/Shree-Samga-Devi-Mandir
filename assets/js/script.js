// ===== SIMPLE DIRECT API CONNECTION - NO COMPLEXITY =====

console.log('🚀 Script loaded - Starting API connection...');

// ===== 1. MANDIR STATUS (No API needed) =====
(function(){
  function updateMandirStatus() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours*60 + minutes;

    const statusText = document.getElementById('mandirStatus');
    const statusDot = document.getElementById('statusDot');
    const nextArti = document.getElementById('nextArti');
    if(!statusText || !statusDot || !nextArti) return;

    let morningClose = 12*60;
    if(day===2) morningClose = 13*60;
    const morningOpen = 7*60;
    const eveningOpen = 16*60;
    const eveningClose = 20*60;

    let isOpen = (currentMinutes >= morningOpen && currentMinutes <= morningClose) ||
                 (currentMinutes >= eveningOpen && currentMinutes <= eveningClose);
    statusText.textContent = isOpen ? "OPEN - " : "CLOSED - ";
    statusDot.style.background = isOpen ? "green" : "red";

    let artiSchedule = [
      { time: "09:00", name: "Next: Morning Arti" },
      { time: "12:00", name: "Next: Afternoon Arti", day: 2 },
      { time: "19:00", name: "Next: Evening Arti" }
    ];

    let next = artiSchedule.find(a=>{
      let artiTime = parseInt(a.time.split(":")[0])*60 + parseInt(a.time.split(":")[1]);
      if(a.day!==undefined && a.day!==day) return false;
      return artiTime > currentMinutes;
    });
    if(!next) next = artiSchedule[0];

    let artiHours = parseInt(next.time.split(":")[0]);
    let artiMinutes = parseInt(next.time.split(":")[1]);
    let ampm = artiHours >= 12 ? 'pm' : 'am';
    artiHours = artiHours % 12;
    if (artiHours === 0) artiHours = 12;
    nextArti.textContent = `${next.name} @ ${artiHours}:${artiMinutes.toString().padStart(2,'0')} ${ampm}`;
  }

  updateMandirStatus();
  setInterval(updateMandirStatus, 60000);
})();

// ===== 2. EVENT SLIDER =====
function __initEventSlider(){
  const eventStage = document.getElementById('eventsSlider');
  if(!eventStage) return;
  const eventCards = eventStage.querySelectorAll('.card--event');
  if(eventCards.length === 0) return;
  
  let currentIndex = 0;
  const total = eventCards.length;
  
  function updateEventSlider(){
    const angle = 360/total;
    eventCards.forEach((card,i)=>{
      const offset = i - currentIndex;
      const rotateY = offset * angle;
      const scale = offset===0?1:0.7;
      const zIndex = offset===0?10:5;
      const opacity = offset===0?1:0.5;
      card.style.transform = `translate(-50%, -50%) rotateY(${rotateY}deg) translateZ(300px) scale(${scale})`;
      card.style.zIndex = zIndex;
      card.style.opacity = opacity;
    });
  }
  
  function nextCard(){ 
    currentIndex = (currentIndex + 1) % total; 
    updateEventSlider(); 
  }
  
  updateEventSlider();
  setInterval(nextCard, 3500);
}

// ===== 3. GALLERY LOOP =====
function __initGalleryLoop(){
  const track = document.querySelector('.gallery-slider__track');
  if(!track) return;
  let position = 0;
  const speed = 0.5;
  
  function animate(){
    position -= speed;
    if(Math.abs(position) >= track.scrollWidth/2){ 
      position = 0; 
    }
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== 4. MAIN API CONNECTION - SIMPLE & DIRECT =====
async function loadContentFromAPI() {
  console.log('📡 Starting API connection...');
  
  // API URL - DIRECT ACCESS
  const API_URL = 'https://adminsamgadevi.infinityfree.me/controllers/api/content.php';
  const API_KEY = 'a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01';
  
  console.log('🎯 API URL:', API_URL);
  console.log('🔑 API Key:', API_KEY ? 'Configured' : 'Missing');
  
  try {
    // DIRECT FETCH - NO COMPLEXITY
    console.log('⏳ Fetching from API...');
    const response = await fetch(`${API_URL}?api_key=${API_KEY}`);
    
    console.log('📊 Response Status:', response.status);
    console.log('✅ Response OK:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📦 API Response:', result);
    
    if (!result.success) {
      throw new Error(`API Error: ${result.error}`);
    }
    
    const data = result.data;
    const featuredBooks = result.featuredBooks || [];
    
    console.log('✅ SUCCESS! Content loaded from API');
    console.log('📄 Sections:', Object.keys(data));
    console.log('📚 Books:', featuredBooks.length);
    
    // ===== UPDATE HOMEPAGE CONTENT =====
    
    // 1. Brand/Logo
    if(data.site?.brandDev) {
      document.getElementById('brandDev').textContent = data.site.brandDev;
      console.log('✅ Brand Dev updated');
    }
    if(data.site?.brandEn) {
      document.getElementById('brandEn').textContent = data.site.brandEn;
      console.log('✅ Brand En updated');
    }
    
    // 2. Hero Section
    if(data.site?.hero?.subtitle) {
      document.getElementById('heroSubtitle').textContent = data.site.hero.subtitle;
      console.log('✅ Hero subtitle updated');
    }
    if(data.site?.hero?.title) {
      document.getElementById('heroTitle').textContent = data.site.hero.title;
      console.log('✅ Hero title updated');
    }
    if(data.site?.hero?.backgroundImage) {
      const hero = document.querySelector('.hero');
      hero.style.backgroundImage = `url('${data.site.hero.backgroundImage}')`;
      console.log('✅ Hero background image updated:', data.site.hero.backgroundImage);
    }
    
    // 3. About Section
    if(data.about?.title) {
      document.getElementById('aboutTitle').textContent = data.about.title;
      console.log('✅ About title updated');
    }
    if(data.about?.text) {
      document.getElementById('aboutText').textContent = data.about.text;
      console.log('✅ About text updated');
    }
    if(data.about?.image) {
      const aboutImg = document.getElementById('aboutImage');
      aboutImg.src = data.about.image;
      aboutImg.style.display = 'block';
      console.log('✅ About image updated:', data.about.image);
    }
    
    // 4. Events Section
    if(Array.isArray(data.events) && data.events.length > 0) {
      const eventsSlider = document.getElementById('eventsSlider');
      eventsSlider.innerHTML = '';
      
      data.events.forEach(evt => {
        const article = document.createElement('article');
        article.className = 'card card--event';
        article.innerHTML = `
          <img src="${evt.image}" alt="${evt.title}">
          <div class="card__overlay">
            <span class="event-date">${evt.date||''}</span>
            <h3>${evt.title||''}</h3>
            <p>${evt.description||''}</p>
          </div>`;
        eventsSlider.appendChild(article);
      });
      
      console.log(`✅ Events loaded: ${data.events.length} events`);
      __initEventSlider();
    }
    
    // 5. Gallery Section
    if(Array.isArray(data.gallery) && data.gallery.length > 0) {
      const galleryTrack = document.getElementById('galleryTrack');
      galleryTrack.innerHTML = '';
      
      const items = [...data.gallery, ...data.gallery]; // Duplicate for loop
      items.forEach(img => {
        const a = document.createElement('a');
        a.href = img.large || img.image;
        a.className = 'gallery-slider__item';
        a.setAttribute('data-lightbox', '');
        a.innerHTML = `<img src="${img.small || img.image}" alt="${img.alt||''}">`;
        galleryTrack.appendChild(a);
      });
      
      console.log(`✅ Gallery loaded: ${data.gallery.length} images`);
      __initGalleryLoop();
    }
    
    // 6. Donation Section
    if(data.donation?.description) {
      document.getElementById('donationDescription').textContent = data.donation.description;
      console.log('✅ Donation description updated');
    }
    if(data.donation?.link) {
      document.getElementById('donateBtn').href = data.donation.link;
      console.log('✅ Donate button link updated');
    }
    
    // 7. Footer Contact
    if(data.contact?.name) {
      document.getElementById('footerTitle').textContent = data.contact.name;
      console.log('✅ Footer title updated');
    }
    if(data.contact?.phone) {
      const phone = document.getElementById('footerPhone');
      phone.textContent = data.contact.phone;
      phone.href = `tel:${data.contact.phone.replace(/\s+/g,'')}`;
      console.log('✅ Footer phone updated');
    }
    if(data.contact?.email) {
      const email = document.getElementById('footerEmail');
      email.textContent = data.contact.email;
      email.href = `mailto:${data.contact.email}`;
      console.log('✅ Footer email updated');
    }
    
    // 8. Social Links
    if(data.social?.facebook) document.getElementById('footerFacebook').href = data.social.facebook;
    if(data.social?.instagram) document.getElementById('footerInstagram').href = data.social.instagram;
    if(data.social?.youtube) document.getElementById('footerYouTube').href = data.social.youtube;
    if(data.social?.whatsapp) document.getElementById('footerWhatsapp').href = `https://wa.me/${data.social.whatsapp}`;
    console.log('✅ Social links updated');
    
    // 9. Map
    if(data.map?.lat && data.map?.lng) {
      document.getElementById('mapDirections').href = `https://www.google.com/maps/dir/?api=1&destination=${data.map.lat},${data.map.lng}`;
      document.getElementById('mapEmbed').src = `https://www.google.com/maps?q=${data.map.lat},${data.map.lng}&z=16&output=embed`;
      console.log('✅ Map updated');
    }
    
    // 10. Year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    console.log('🎉 ALL CONTENT LOADED SUCCESSFULLY FROM API!');
    
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
    console.error('Error Details:', error.message);
    
    // Show error on page
    const hero = document.querySelector('.hero');
    if(hero) {
      hero.style.backgroundImage = "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 1200 600%27%3E%3Crect fill=%27%23800000%27 width=%271200%27 height=%27600%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%23FFD700%27 font-size=%2748%27 font-family=%27Arial%27%3EShree Samga Devi Mandir%3C/text%3E%3C/svg%3E')";
    }
  }
}

// ===== 5. LOAD ON PAGE READY =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM Ready - Loading content from API...');
  loadContentFromAPI();
});

// Also try immediately if DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('✅ DOM Already Ready - Loading content from API...');
  loadContentFromAPI();
}

// ===== 6. DONATION BUTTON =====
document.addEventListener('click', function(e) {
  if(e.target.closest('.btn--gold') || e.target.closest('.method')) {
    e.preventDefault();
    alert('Donation is temporarily closed.');
  }
});

console.log('✅ Script initialization complete');
