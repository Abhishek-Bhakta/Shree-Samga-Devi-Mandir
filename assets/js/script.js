// ===== API Configuration =====
const API_BASE = window.API_BASE_URL || 'https://adminsamgadevi.infinityfree.me';
let appData = {
  content: null,
  featuredBooks: [],
  isAuthenticated: false,
  user: null
};

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


// ===== Event Slider (3D) initializer =====
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

// ===== Dynamic Content Loader from API =====
async function loadContentFromAPI() {
  try {
    console.log('Loading content from API...');
    console.log('API_BASE:', API_BASE);
    console.log('API_KEY:', window.API_KEY ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_BASE}/controllers/api/content.php`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': window.API_KEY || ''
      },
      cache: 'no-store' // Disable caching to always get fresh data
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('Content loaded successfully:', result.data);
      appData.content = result.data;
      appData.featuredBooks = result.featuredBooks || [];
      
      // Update all UI elements
      updateUIWithContent(result.data, result.featuredBooks);
    } else {
      throw new Error(result.error || 'Failed to load content');
    }
  } catch (error) {
    console.error('Error loading content from API:', error);
    
    // Fallback: Try loading from local JSON file
    console.log('Falling back to local JSON file...');
    loadContentFromLocalJSON();
  }
}

// Fallback to local JSON
async function loadContentFromLocalJSON() {
  try {
    const response = await fetch('data/content.json', {cache:'no-store'});
    if(!response.ok) throw new Error('Content not found');
    const data = await response.json();
    
    console.log('Loaded from local JSON:', data);
    appData.content = data;
    
    // For books, we'll try API
    try {
      const booksResponse = await fetch(`${API_BASE}/controllers/api/books.php`, {
        headers: {
          'X-API-Key': window.API_KEY || ''
        },
        cache: 'no-store' // Disable caching
      });
      const booksResult = await booksResponse.json();
      appData.featuredBooks = booksResult.books?.slice(0, 6) || [];
    } catch (e) {
      console.warn('Failed to load books from API:', e.message);
      appData.featuredBooks = [];
    }
    
    updateUIWithContent(data, appData.featuredBooks);
  } catch (e) {
    console.error('Failed to load from local JSON:', e);
  }
}

// Update UI with loaded content
function updateUIWithContent(data, featuredBooks) {
  // Helper function to handle image paths from API
  function getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // Add cache-busting timestamp for images
      const separator = imagePath.includes('?') ? '&' : '?';
      return `${imagePath}${separator}_t=${Date.now()}`;
    }
    
    // For localhost testing: API returns absolute URLs now
    // But if we get relative paths, prepend API_BASE
    const fullUrl = `${API_BASE}/${imagePath}`;
    // Add cache-busting timestamp
    return `${fullUrl}?_t=${Date.now()}`;
  }
  
  // Header/Brand
  const brandDev = document.getElementById('brandDev');
  const brandEn = document.getElementById('brandEn');
  const siteLogo = document.getElementById('siteLogo');
  
  if(brandDev && data.site?.brandDev) brandDev.textContent = data.site.brandDev;
  if(brandEn && data.site?.brandEn) brandEn.textContent = data.site.brandEn;
  if(siteLogo && data.site?.logo) {
    siteLogo.src = getImageUrl(data.site.logo);
    siteLogo.style.display = 'block';
    console.log('Site logo loaded:', getImageUrl(data.site.logo));
  }

  // Hero
  const heroSubtitle = document.getElementById('heroSubtitle');
  const heroTitle = document.getElementById('heroTitle');
  const hero = document.querySelector('.hero');
  if(heroSubtitle && data.site?.hero?.subtitle) heroSubtitle.textContent = data.site.hero.subtitle;
  if(heroTitle && data.site?.hero?.title) heroTitle.textContent = data.site.hero.title;
  
  // Set hero background images
  if (hero) {
    const desktopBg = getImageUrl(data.site?.hero?.backgroundImage) || '';
    const mobileBg = getImageUrl(data.site?.hero?.mobileBackgroundImage) || '';
    
    if (desktopBg) {
      hero.setAttribute('data-desktop-bg', desktopBg);
      hero.style.backgroundImage = `url('${desktopBg}')`;
    }
    if (mobileBg) {
      hero.setAttribute('data-mobile-bg', mobileBg);
    }
  }

  // About
  const aboutTitle = document.getElementById('aboutTitle');
  const aboutText = document.getElementById('aboutText');
  const aboutImage = document.getElementById('aboutImage');
  const aboutModalTitle = document.getElementById('aboutModalTitle');
  const aboutModalContent = document.getElementById('aboutModalContent');
  const aboutModalImage = document.getElementById('aboutModalImage');
  
  if(aboutTitle && data.about?.title) aboutTitle.textContent = data.about.title;
  if(aboutText && data.about?.text) {
    const truncatedText = data.about.text.length > 200 
      ? data.about.text.substring(0, 200) + '...' 
      : data.about.text;
    aboutText.textContent = truncatedText;
  }
  if(aboutImage && data.about?.image) {
    aboutImage.src = getImageUrl(data.about.image);
    aboutImage.style.display = 'block';
    console.log('About image loaded:', getImageUrl(data.about.image));
  } else {
    console.warn('About image not found in data');
  }
  if(aboutModalTitle && data.about?.title) aboutModalTitle.textContent = data.about.title;
  if(aboutModalContent && data.about?.text) aboutModalContent.innerHTML = data.about.text.replace(/\n/g, '<br>');
  if(aboutModalImage && data.about?.image) {
    aboutModalImage.src = getImageUrl(data.about.image);
    aboutModalImage.style.display = 'block';
  }

  // Events
  const eventsSlider = document.getElementById('eventsSlider');
  if(eventsSlider && Array.isArray(data.events)){
    eventsSlider.innerHTML = '';
    const validEvents = data.events.filter(evt => evt.title && evt.title.trim() !== '');
    
    if (validEvents.length > 0) {
      validEvents.forEach(evt => {
        const article = document.createElement('article');
        article.className = 'card card--event';
        const eventImage = getImageUrl(evt.image) || 'https://dummyimage.com/400x600/fff7e6/800000&text=Event';
        article.innerHTML = `
          <img src="${eventImage}" alt="${evt.title}">
          <div class="card__overlay">
            <span class="event-date">${evt.date||''}</span>
            <h3>${evt.title||''}</h3>
            <p>${evt.description||''}</p>
          </div>`;
        eventsSlider.appendChild(article);
      });
      __initEventSlider();
    } else {
      eventsSlider.innerHTML = '<p style="color:white;text-align:center;">No events scheduled</p>';
    }
  }

  // Featured Books (E-Books Section)
  const featuredBooksContainer = document.getElementById('featuredBooksContainer');
  if(featuredBooksContainer) {
    console.log('Featured books count:', featuredBooks ? featuredBooks.length : 0);
    
    if (featuredBooks && featuredBooks.length > 0) {
      let booksHTML = '<div class="books-scroll">';
      featuredBooks.forEach(book => {
        console.log('Loading book:', book.title, 'Cover:', book.cover_path);
        const coverUrl = getImageUrl(book.cover_path) || 'https://dummyimage.com/400x600/fff7e6/800000&text=E-Book';
        booksHTML += `
          <article class="book-card" tabindex="0">
            <img src="${coverUrl}" alt="${book.title} Cover">
            <div class="book-overlay">
              <strong>${book.title}</strong>
              ${book.author ? `<div class="book-meta">By ${book.author} • ${book.language.toUpperCase()}</div>` : ''}
              ${book.avg_rating > 0 ? `<div class="rating-small">⭐ ${book.avg_rating} (${book.review_count} reviews)</div>` : ''}
              ${book.categories ? `
                <div class="book-categories-inline">
                  ${book.categories.split(', ').slice(0, 2).map(cat => `<span class="category-tag-small">${cat}</span>`).join('')}
                </div>
              ` : ''}
              <div class="book-actions">
                <a href="https://adminsamgadevi.infinityfree.me/ebook/view.php?id=${book.id}" class="btn">Read</a>
                <a href="https://adminsamgadevi.infinityfree.me/ebook/download.php?id=${book.id}" class="btn btn--outline">Download</a>
              </div>
            </div>
          </article>
        `;
      });
      booksHTML += '</div>';
      booksHTML += `
        <div class="ebooks-footer">
          <a href="https://adminsamgadevi.infinityfree.me/ebook/index.php" class="btn btn--gold">
            <i class="fas fa-books"></i> View All E-Books
          </a>
        </div>
      `;
      featuredBooksContainer.innerHTML = booksHTML;
      console.log('Books HTML rendered successfully');
    } else {
      console.warn('No featured books available');
      featuredBooksContainer.innerHTML = `
        <div class="ebooks-empty">
          <div class="empty-state">
            <i class="fas fa-book-open fa-3x"></i>
            <h3>E-Books Coming Soon</h3>
            <p>We're preparing a collection of spiritual books for you. Please check back later.</p>
          </div>
        </div>
      `;
    }
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
    const validImages = data.gallery.filter(img => img.image && img.image.trim() !== '');
    
    if (validImages.length > 0) {
      const items = [...validImages, ...validImages]; // duplicate for loop effect
      items.forEach(img => {
        const a = document.createElement('a');
        const galleryImage = getImageUrl(img.image) || '';
        a.href = galleryImage; 
        a.className='gallery-slider__item'; 
        a.setAttribute('data-lightbox','');
        a.innerHTML = `<img src="${galleryImage}" alt="${img.alt||''}">`;
        galleryTrack.appendChild(a);
      });
      __initGalleryLoop();
    }
  }

  // Footer and Contact
  const footerTitle = document.getElementById('footerTitle');
  const footerPhone = document.getElementById('footerPhone');
  const footerEmail = document.getElementById('footerEmail');
  const footerFacebook = document.getElementById('footerFacebook');
  const footerInstagram = document.getElementById('footerInstagram');
  const footerYouTube = document.getElementById('footerYouTube');
  const footerWhatsapp = document.getElementById('footerWhatsapp');
  const footerAddress = document.getElementById('footerAddress');
  const mapDirections = document.getElementById('mapDirections');
  const mapEmbed = document.getElementById('mapEmbed');
  
  if(footerTitle && data.contact?.name) footerTitle.textContent = data.contact.name;
  if(footerPhone && data.contact?.phone){ 
    footerPhone.textContent = data.contact.phone; 
    footerPhone.href = `tel:${data.contact.phone.replace(/\s+/g,'')}`; 
  }
  if(footerEmail && data.contact?.email){ 
    footerEmail.textContent = data.contact.email; 
    footerEmail.href = `mailto:${data.contact.email}`; 
  }
  if(footerAddress && data.contact?.addressLines) {
    footerAddress.innerHTML = data.contact.addressLines.map(line => `<br>${line}`).join('');
  }
  if(footerFacebook && data.social?.facebook) footerFacebook.href = data.social.facebook;
  if(footerInstagram && data.social?.instagram) footerInstagram.href = data.social.instagram;
  if(footerYouTube && data.social?.youtube) footerYouTube.href = data.social.youtube;
  if(footerWhatsapp && data.social?.whatsapp) footerWhatsapp.href = `https://wa.me/${data.social.whatsapp}`;
  
  if(mapDirections && data.map?.lat && data.map?.lng){
    mapDirections.href = `https://www.google.com/maps/dir/?api=1&destination=${data.map.lat},${data.map.lng}`;
  }
  if(mapEmbed && data.map?.lat && data.map?.lng){
    mapEmbed.src = `https://www.google.com/maps?q=${data.map.lat},${data.map.lng}&z=16&output=embed`;
  }

  // Year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  
  console.log('UI updated successfully with content');
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Load content from API
  loadContentFromAPI();
  
  // Initialize Instagram embeds
  setTimeout(function() {
    if (typeof window.instgrm !== 'undefined' && window.instgrm.Embeds) {
      console.log('Processing Instagram embeds');
      window.instgrm.Embeds.process();
    } else {
      console.warn('Instagram embed script not loaded');
    }
  }, 1000);
  
  setTimeout(function() {
    if (typeof window.instgrm !== 'undefined' && window.instgrm.Embeds) {
      console.log('Processing Instagram embeds (second attempt)');
      window.instgrm.Embeds.process();
    }
  }, 3000);
});

// Modal functionality
document.addEventListener('click', function(e) {
  const modalTrigger = e.target.closest('[data-open-modal]');
  if (modalTrigger) {
    e.preventDefault();
    const modalId = modalTrigger.getAttribute('data-open-modal');
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'grid';
    }
  }
  
  const modalClose = e.target.closest('.modal__close');
  if (modalClose) {
    const modal = modalClose.closest('.modal');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }
  
  // Close on outside click
  if (e.target.classList.contains('modal')) {
    e.target.setAttribute('aria-hidden', 'true');
    e.target.style.display = 'none';
  }
});

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.getElementById('navMenu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      const isOpen = navMenu.classList.contains('open');
      
      // Toggle the open class on menu
      navMenu.classList.toggle('open');
      
      // Toggle active state on hamburger button
      navToggle.classList.toggle('active');
      
      // Update aria-expanded attribute
      navToggle.setAttribute('aria-expanded', !isOpen);
    });
    
    // Close menu when clicking on a nav link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});
