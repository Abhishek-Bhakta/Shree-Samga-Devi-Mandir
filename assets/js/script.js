// ===== Mandir Open-Close & Next Arti =====
(function(){
  function formatTime12Hr(hours, minutes) {
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes.toString().padStart(2,'0')} ${ampm}`;
  }

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

    let morningClose = 12*60; // 12:00 pm normal
    if(day===2) morningClose = 13*60; // Tuesday
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
    if(!next){
      next = artiSchedule.find(a=>{
        if(a.day!==undefined && a.day!==(day+1)%7) return false;
        return true;
      }) || artiSchedule[0];
    }

    let artiHours = parseInt(next.time.split(":")[0]);
    let artiMinutes = parseInt(next.time.split(":")[1]);
    nextArti.textContent = `${next.name} @ ${formatTime12Hr(artiHours, artiMinutes)}`;
  }

  window.__updateMandirStatus = updateMandirStatus;
  updateMandirStatus();
  setInterval(updateMandirStatus, 60000); // har minute update
})();


// ===== Event Slider (3D) initializer (called after dynamic cards render) =====
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
  function nextCard(){ currentIndex = (currentIndex + 1) % total; updateEventSlider(); }
  function prevCard(){ currentIndex = (currentIndex - 1 + total) % total; updateEventSlider(); }
  updateEventSlider();
  let autoSlide = setInterval(nextCard, 3500);
  // Swipe
  let startX = 0;
  eventStage.addEventListener('touchstart', e=>startX = e.touches[0].clientX);
  eventStage.addEventListener('touchend', e=>{
    let endX = e.changedTouches[0].clientX;
    if(endX-startX>50) prevCard();
    else if(startX-endX>50) nextCard();
  });
}

// Pooja Modal Functionality
(function(){
  const poojaModal = document.getElementById('poojaModal');
  if(!poojaModal) return;
  const modalClose = poojaModal.querySelector('.pooja-modal__close');
  const modalPoojaName = document.getElementById('modalPoojaName');
  const modalPoojaDescription = document.getElementById('modalPoojaDescription');
  const modalPanditName = document.getElementById('modalPanditName');
  const modalPanditPhone = document.getElementById('modalPanditPhone');
  const modalPanditPhoto = document.getElementById('modalPanditPhoto');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

  document.addEventListener('click', (e)=>{
    const card = e.target.closest('.card--pooja');
    if(!card) return;
    const pooja = JSON.parse(card.dataset.pooja);
    modalPoojaName.textContent = pooja.name;
    modalPoojaDescription.textContent = pooja.description || "";
    modalPanditName.textContent = pooja.pandit;
    modalPanditPhone.textContent = pooja.phone;
    modalPanditPhoto.src = pooja.photo;
    modalWhatsAppBtn.href = `https://wa.me/${pooja.whatsapp}`;
    poojaModal.style.display = 'flex';
  });
  modalClose.addEventListener('click', ()=> poojaModal.style.display='none');
  poojaModal.addEventListener('click', e => { if(e.target===poojaModal) poojaModal.style.display='none'; });
})();

document.addEventListener('DOMContentLoaded', () => {
  const methods = document.querySelectorAll('.donate__methods .method, .btn--gold');

  methods.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault(); // prevent default action
      // Temporary alert popup
      alert('Donation is temporarily closed.');
    });
  });
});


// Remove unused manual gallery slider controls to avoid errors (no arrows/dots present)




// Continuous gallery loop (initialized after content load)
function __initGalleryLoop(){
  const track = document.querySelector('.gallery-slider__track');
  if(!track) return;
  let position = 0;
  const speed = 0.5;
  function animate(){
    position -= speed;
    if(Math.abs(position) >= track.scrollWidth/2){ position = 0; }
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== Dynamic Content Loader with Backend API Connection =====
// Skip client fetch when SSR has already rendered content
(async function(){
  if (window.__SSR) {
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    const eventsSlider = document.getElementById('eventsSlider');
    if(eventsSlider && eventsSlider.querySelector('.card--event')) __initEventSlider();
    const galleryTrack = document.getElementById('galleryTrack');
    if(galleryTrack && galleryTrack.children.length>0) __initGalleryLoop();
    return;
  }
  try {
    // Use API endpoint with proper authentication for live site
    const API_BASE = window.API_BASE_URL || '';
    const API_KEY = window.API_KEY || '';
    
    console.log('🔄 Fetching content from API:', `${API_BASE}/controllers/api/content.php`);
    console.log('🔑 Using API Key:', API_KEY ? 'Yes (configured)' : 'No (missing)');
    
    const res = await fetch(`${API_BASE}/controllers/api/content.php?api_key=${API_KEY}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });
    
    console.log('📡 Response status:', res.status);
    console.log('📡 Response OK:', res.ok);
    
    if(!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error Response:', errorText);
      
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If response is not JSON, use the text as error message
        errorData = { error: errorText };
      }
      
      throw new Error(`API Error ${res.status}: ${errorData.error || res.statusText}`);
    }
    
    const apiResponse = await res.json();
    
    if (!apiResponse.success) {
      throw new Error(`API returned error: ${apiResponse.error}`);
    }
    
    const data = apiResponse.data;
    const featuredBooks = apiResponse.featuredBooks || [];
    
    console.log('✅ Content loaded successfully from API');
    console.log('📊 Content sections:', Object.keys(data));
    console.log('📚 Featured books count:', featuredBooks.length);

    // Header/Brand
    const brandDev = document.getElementById('brandDev');
    const brandEn = document.getElementById('brandEn');
    if(brandDev && data.site?.brandDev) brandDev.textContent = data.site.brandDev;
    if(brandEn && data.site?.brandEn) brandEn.textContent = data.site.brandEn;

    // Hero
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroTitle = document.getElementById('heroTitle');
    const hero = document.querySelector('.hero');
    if(heroSubtitle && data.site?.hero?.subtitle) heroSubtitle.textContent = data.site.hero.subtitle;
    if(heroTitle && data.site?.hero?.title) heroTitle.textContent = data.site.hero.title;
    if(hero && data.site?.hero?.backgroundImage) hero.style.backgroundImage = `url('${data.site.hero.backgroundImage}')`;

    // About
    const aboutTitle = document.getElementById('aboutTitle');
    const aboutText = document.getElementById('aboutText');
    const aboutImage = document.getElementById('aboutImage');
    if(aboutTitle && data.about?.title) aboutTitle.textContent = data.about.title;
    if(aboutText && data.about?.text) aboutText.textContent = data.about.text;
    if(aboutImage && data.about?.image) aboutImage.src = data.about.image;

    // Events
    const eventsSlider = document.getElementById('eventsSlider');
    if(eventsSlider && Array.isArray(data.events)){
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
      __initEventSlider();
    }

    // Poojas
    const poojaWrap = document.getElementById('poojaCards');
    if(poojaWrap && Array.isArray(data.poojas)){
      poojaWrap.innerHTML = '';
      data.poojas.forEach(p => {
        const a = document.createElement('article');
        a.className = 'card card--pooja';
        a.tabIndex = 0;
        a.dataset.pooja = JSON.stringify(p);
        a.innerHTML = `
          <div class="card__icon"><i class="fas fa-om"></i></div>
          <h3>${p.name}</h3>`;
        poojaWrap.appendChild(a);
      });
    }

    // Donation
    const donationDescription = document.getElementById('donationDescription');
    const donateBtn = document.getElementById('donateBtn');
    if(donationDescription && data.donation?.description) donationDescription.textContent = data.donation.description;
    if(donateBtn && data.donation?.link) donateBtn.href = data.donation.link;

    // Gallery
    const galleryTrack = document.getElementById('galleryTrack');
    if(galleryTrack && Array.isArray(data.gallery)){
      galleryTrack.innerHTML = '';
      const items = [...data.gallery, ...data.gallery]; // duplicate for loop
      items.forEach(img => {
        const a = document.createElement('a');
        a.href = img.large; a.className='gallery-slider__item'; a.setAttribute('data-lightbox','');
        a.innerHTML = `<img src="${img.small}" alt="${img.alt||''}">`;
        galleryTrack.appendChild(a);
      });
      __initGalleryLoop();
    }

    // Social embeds + footer
    const fbEmbed = document.getElementById('facebookEmbed');
    const igEmbed = document.getElementById('instagramEmbed');
    if(fbEmbed && data.social?.facebookPagePluginUrl) fbEmbed.src = data.social.facebookPagePluginUrl;
    if(igEmbed && data.social?.instagramEmbedUrl) igEmbed.src = data.social.instagramEmbedUrl;

    const footerTitle = document.getElementById('footerTitle');
    const footerPhone = document.getElementById('footerPhone');
    const footerEmail = document.getElementById('footerEmail');
    const footerFacebook = document.getElementById('footerFacebook');
    const footerInstagram = document.getElementById('footerInstagram');
    const footerYouTube = document.getElementById('footerYouTube');
    const footerWhatsapp = document.getElementById('footerWhatsapp');
    if(footerTitle && data.contact?.name) footerTitle.textContent = data.contact.name;
    if(footerPhone && data.contact?.phone){ footerPhone.textContent = data.contact.phone; footerPhone.href = `tel:${data.contact.phone.replace(/\s+/g,'')}`; }
    if(footerEmail && data.contact?.email){ footerEmail.textContent = data.contact.email; footerEmail.href = `mailto:${data.contact.email}`; }
    if(footerFacebook && data.social?.facebook) footerFacebook.href = data.social.facebook;
    if(footerInstagram && data.social?.instagram) footerInstagram.href = data.social.instagram;
    if(footerYouTube && data.social?.youtube) footerYouTube.href = data.social.youtube;
    if(footerWhatsapp && data.social?.whatsapp) footerWhatsapp.href = `https://wa.me/${data.social.whatsapp}`;

    // Map
    const mapDirections = document.getElementById('mapDirections');
    const mapEmbed = document.getElementById('mapEmbed');
    if(mapDirections && data.map?.lat && data.map?.lng){
      mapDirections.href = `https://www.google.com/maps/dir/?api=1&destination=${data.map.lat},${data.map.lng}`;
    }
    if(mapEmbed && data.map?.lat && data.map?.lng){
      mapEmbed.src = `https://www.google.com/maps?q=${data.map.lat},${data.map.lng}&z=16&output=embed`;
    }

    // Year
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
  } catch (e) {
    console.error('Error loading content from API:', e);
    console.log('Falling back to local JSON file...');
    
    // Fallback to local JSON
    try {
      const res = await fetch('data/content.json', {cache:'no-store'});
      if(!res.ok) throw new Error('Content not found');
      const data = await res.json();
      
      // Same content loading logic as above (simplified for fallback)
      const brandDev = document.getElementById('brandDev');
      const brandEn = document.getElementById('brandEn');
      if(brandDev && data.site?.brandDev) brandDev.textContent = data.site.brandDev;
      if(brandEn && data.site?.brandEn) brandEn.textContent = data.site.brandEn;
      
      console.log('Loaded from local JSON fallback');
    } catch (fallbackError) {
      console.error('Failed to load from local JSON:', fallbackError);
    }
  }
})();


