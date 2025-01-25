// builder.js
document.addEventListener('DOMContentLoaded', async () => {
  let heroSlides = [
    { imageUrl: "", callToAction: "" },
    { imageUrl: "", callToAction: "" },
    { imageUrl: "", callToAction: "" },
  ];
  let allCsvPhotos = [];

  // 1) Parse CSV
  try {
    const csvResp = await fetch('Sheet1.csv');
    const csvText = await csvResp.text();
    allCsvPhotos = parseCSV(csvText);
    console.log("Loaded CSV photos:", allCsvPhotos.length);
  } catch(err) {
    console.warn("Error loading CSV:", err);
  }

  // 2) Render or attach events for your hero controls
  function updateHeroPreview() {
    heroSlides.forEach((slide, idx) => {
      const slideEl = document.querySelector(`.slide[data-slide-index="${idx}"]`);
      if (slideEl) {
        slideEl.style.backgroundImage = slide.imageUrl ? `url("${slide.imageUrl}")` : "none";
        // If you also have CTA text in .hero-desc, do something similar
        const ctaEl = slideEl.querySelector(`[data-hero-cta="${idx}"]`);
        if(ctaEl) ctaEl.textContent = slide.callToAction || "";
      }
    });
  }

  function parseCSV(csvString) {
    const lines = csvString.trim().split(/\r?\n/);
    const headers = lines[0].split(",");
    const data = [];
    for(let i=1; i<lines.length; i++){
      const rowObj = {};
      const cells = lines[i].split(",");
      headers.forEach((h, cidx) => {
        rowObj[h.trim()] = cells[cidx] ? cells[cidx].trim() : "";
      });
      data.push(rowObj);
    }
    return data;
  }

  document.querySelectorAll('.image-url-input').forEach(input => {
    input.addEventListener('input', e => {
      const idx = e.target.dataset.idx;
      heroSlides[idx].imageUrl = e.target.value;
      updateHeroPreview();
    });
  });

  document.querySelectorAll('.cta-text-input').forEach(input => {
    input.addEventListener('input', e => {
      const idx = e.target.dataset.idx;
      heroSlides[idx].callToAction = e.target.value;
      updateHeroPreview();
    });
  });

  // Open gallery
  document.querySelectorAll('.openGalleryBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.idx;
      openPhotoModal(idx);
    });
  });

  function openPhotoModal(slideIndex) {
    const modal = document.getElementById('photoModal');
    const gallery = document.getElementById('photoGallery');
    if (!modal || !gallery) return;

    gallery.innerHTML = ""; // Clear old items
    // create an element for each row in CSV
    allCsvPhotos.forEach(row => {
      const photoUrl = row.photo_url_big || row.photo_url;
      if(!photoUrl) return;
      const div = document.createElement('div');
      div.className = 'photo-item';
      div.innerHTML = `
        <img src="${photoUrl}" alt="Photo from CSV">
        <p>${row.name || 'CSV Photo'}</p>
      `;
      div.addEventListener('click', () => {
        // user picks this image
        heroSlides[slideIndex].imageUrl = photoUrl;
        // update the input field
        const inputEl = document.querySelector(`.image-url-input[data-idx="${slideIndex}"]`);
        if(inputEl) inputEl.value = photoUrl;
        // update preview
        updateHeroPreview();
        // close modal
        modal.classList.add('hidden');
      });
      gallery.appendChild(div);
    });

    // show modal
    modal.classList.remove('hidden');
  }

  // close modal
  const closeModalBtn = document.getElementById('closePhotoModal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('photoModal');
      if(modal) modal.classList.add('hidden');
    });
  }

  // finalize hero
  const finishHeroBtn = document.getElementById('finishHeroBtn');
  finishHeroBtn?.addEventListener('click', () => {
    console.log("Hero setup done:", heroSlides);
    alert("Hero saved! " + JSON.stringify(heroSlides,null,2));
  });

  // initial preview
  updateHeroPreview();
});
