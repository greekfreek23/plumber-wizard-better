// builder.js - The wizard with a nicer hero preview
(() => {

  // We'll fetch from your existing JSON files:
  const FINAL_DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";
  const PHOTO_DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/data/businessPhotoContent.json";

  let finalWebsiteData = null;
  let photoData = null;
  let chosenPlumber = null;
  let chosenPhotos = null;

  // For Hero Step
  let heroIndex = 0; // which hero image we're showing
  let heroImages = []; // array of images for hero

  document.addEventListener('DOMContentLoaded', async () => {
    // Step references
    const step1 = document.getElementById('wizardStep1');
    const step2 = document.getElementById('wizardStep2');
    const step3 = document.getElementById('wizardStep3');
    const step4 = document.getElementById('wizardStep4');

    const step1Next = document.getElementById('step1Next');
    const step2Back = document.getElementById('step2Back');
    const step2Next = document.getElementById('step2Next');
    const step3Back = document.getElementById('step3Back');
    const step3Next = document.getElementById('step3Next');
    const step4Back = document.getElementById('step4Back');
    const finishBtn = document.getElementById('finishBtn');

    // Step1 - siteId selection
    const siteIdSelect = document.getElementById('siteIdSelect');

    // Hero Step elements
    const heroSlide = document.getElementById('heroSlide');
    const ctaInput = document.getElementById('ctaInput');
    const heroSlideIndex = document.getElementById('heroSlideIndex');
    const prevHeroBtn = document.getElementById('prevHeroBtn');
    const nextHeroBtn = document.getElementById('nextHeroBtn');

    // About step
    const aboutText = document.getElementById('aboutText');

    // Final preview
    const previewArea = document.getElementById('previewArea');

    try {
      // 1) fetch both JSONs
      const [resFinal, resPhoto] = await Promise.all([
        fetch(FINAL_DATA_URL),
        fetch(PHOTO_DATA_URL)
      ]);
      if(!resFinal.ok || !resPhoto.ok) throw new Error("Failed to load JSON data");
      const dataFinal = await resFinal.json();
      const dataPhoto = await resPhoto.json();

      finalWebsiteData = dataFinal.finalWebsiteData || [];
      photoData = dataPhoto.businessPhotoContent || {};

      // 2) see if we have ?siteId
      const params = new URLSearchParams(window.location.search);
      const paramSiteId = params.get('siteId');

      if(paramSiteId) {
        // auto skip step1
        step1.classList.add('hidden');
        chooseSite(paramSiteId);
        step2.classList.remove('hidden');
        populateHero();
      } else {
        // Populate dropdown
        finalWebsiteData.forEach(biz => {
          const opt = document.createElement('option');
          opt.value = biz.siteId;
          opt.textContent = biz.siteId + " - " + biz.businessName;
          siteIdSelect.appendChild(opt);
        });
      }

    } catch(err) {
      console.error(err);
      alert("Error: " + err.message);
    }

    // Step1 Next
    step1Next.addEventListener('click', () => {
      const selectedVal = siteIdSelect.value;
      if(!selectedVal) {
        alert("Please select a plumber/business");
        return;
      }
      chooseSite(selectedVal);
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      populateHero();
    });

    function chooseSite(id) {
      chosenPlumber = finalWebsiteData.find(b => b.siteId === id);
      chosenPhotos = photoData[id] || {};
      if(!chosenPlumber) {
        alert("No plumber data found for siteId=" + id);
        return;
      }
      heroImages = (chosenPhotos.heroSection || []).map(obj => {
        return {
          imageIndex: obj.imageIndex,
          callToAction: obj.callToAction || ""
        };
      });
      heroIndex = 0;
    }

    // Step2 - hero builder
    function populateHero() {
      if(!heroImages.length) {
        heroSlide.style.backgroundImage = "none";
        ctaInput.value = "";
        heroSlideIndex.textContent = "No hero images found";
        return;
      }
      if(heroIndex < 0) heroIndex = heroImages.length -1;
      if(heroIndex >= heroImages.length) heroIndex = 0;
      
      const current = heroImages[heroIndex];
      heroSlide.style.backgroundImage = `url('${current.imageIndex}')`;
      ctaInput.value = current.callToAction;
      heroSlideIndex.textContent = `Slide ${heroIndex+1} of ${heroImages.length}`;
    }

    prevHeroBtn?.addEventListener('click', () => {
      // store current CTA in array
      if(heroImages[heroIndex]) {
        heroImages[heroIndex].callToAction = ctaInput.value.trim();
      }
      heroIndex--;
      populateHero();
    });

    nextHeroBtn?.addEventListener('click', () => {
      // store current CTA
      if(heroImages[heroIndex]) {
        heroImages[heroIndex].callToAction = ctaInput.value.trim();
      }
      heroIndex++;
      populateHero();
    });

    // store CTA as user types
    ctaInput?.addEventListener('input', () => {
      if(heroImages[heroIndex]) {
        heroImages[heroIndex].callToAction = ctaInput.value;
      }
    });

    step2Back.addEventListener('click', () => {
      step2.classList.add('hidden');
      step1.classList.remove('hidden');
    });

    step2Next.addEventListener('click', () => {
      // store last CTA
      if(heroImages[heroIndex]) {
        heroImages[heroIndex].callToAction = ctaInput.value.trim();
      }
      step2.classList.add('hidden');
      step3.classList.remove('hidden');
      // if about text exists, show
      if(chosenPlumber && chosenPlumber.aboutUs) {
        aboutText.value = chosenPlumber.aboutUs;
      }
    });

    // Step3 - about
    step3Back.addEventListener('click', () => {
      step3.classList.add('hidden');
      step2.classList.remove('hidden');
    });
    step3Next.addEventListener('click', () => {
      if(chosenPlumber) {
        chosenPlumber.aboutUs = aboutText.value.trim();
      }
      step3.classList.add('hidden');
      step4.classList.remove('hidden');
      buildPreview();
    });

    // Step4 - final preview
    step4Back.addEventListener('click', () => {
      step4.classList.add('hidden');
      step3.classList.remove('hidden');
    });
    finishBtn.addEventListener('click', () => {
      alert("Here we would create final HTML or let user download. Placeholder for now!");
    });

    function buildPreview() {
      if(!chosenPlumber) return;
      let previewHTML = `<h2>${chosenPlumber.businessName || "Business"}</h2>
                         <h3>Hero Images</h3>`;
      heroImages.forEach((img, i) => {
        previewHTML += `<div>
          <p><strong>Image ${i+1}:</strong> ${img.imageIndex}</p>
          <p>CTA: ${img.callToAction}</p>
        </div>`;
      });
      previewHTML += `<h3>About Us</h3><p>${chosenPlumber.aboutUs || ''}</p>`;
      previewArea.innerHTML = previewHTML;
    }

  });
})();
