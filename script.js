// Unified JS for hero animation, about, skills, languages, timeline, and projects

// Wait for DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const layers = document.querySelectorAll('.hero-layers .layer');
    const icons = document.querySelectorAll('.hero-icon');
    const layerNames = ['tech', 'author', 'global', 'vet', 'dog'];
    let currentIndex = 0;
    let autoCycle;
  
    function animateHeroCycle() {
      autoCycle = setInterval(() => {
        currentIndex = (currentIndex + 1) % layerNames.length;
        showLayer(layerNames[currentIndex]);
      }, 5000);
    }
  
    function showLayer(name) {
      layers.forEach(layer => {
        layer.style.backgroundImage = `url('assets/images/hero-${name}.jpg')`;
        gsap.to(layer, {
          opacity: layer.classList.contains(name) ? 0.25 : 0,
          duration: 1,
          ease: 'power2.inOut'
        });
      });
      icons.forEach(icon => {
        icon.classList.toggle('active', icon.dataset.layer === name);
      });
    }
  
    icons.forEach(icon => {
      icon.addEventListener('click', () => {
        clearInterval(autoCycle);
        const name = icon.dataset.layer;
        currentIndex = layerNames.indexOf(name);
        showLayer(name);
      });
    });
  
    showLayer(layerNames[0]);
    animateHeroCycle();
  
    gsap.from(".hero-content h1", { y: -50, opacity: 0, duration: 1 });
    gsap.from(".hero-subtitle", { y: 30, opacity: 0, duration: 1, delay: 0.3 });
  
    // Animate Panels (scroll storytelling)
    document.querySelectorAll('.panel').forEach((section, index) => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'power4.out',
        delay: index * 0.1
      });
    });
  
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger-menu');
    const menu = document.querySelector('.fullscreen-menu');
    if (hamburger && menu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        menu.classList.toggle('show');
      });
    }
  
    // Load and Animate Skills (flip cards + animated meters)
    fetch('assets/data/skills.json')
      .then(res => res.json())
      .then(skills => {
        const container = document.getElementById('skillsContainer');
        skills.forEach(skill => {
          const div = document.createElement('div');
          div.className = 'skill-card';
          div.innerHTML = `
            <div class="skill-inner">
              <div class="skill-front">
                <img src="${skill.icon}" alt="${skill.name}" width="40" height="40" />
              </div>
              <div class="skill-back">
                <h4>${skill.name}</h4>
                <div class="meter"><span></span></div>
              </div>
            </div>
          `;
          container.appendChild(div);
          div.addEventListener('mouseenter', () => div.classList.add('flipped'));
          div.addEventListener('mouseleave', () => div.classList.remove('flipped'));
          gsap.fromTo(div.querySelector('.meter span'), {
            width: '0%'
          }, {
            scrollTrigger: {
              trigger: div,
              start: 'top 85%'
            },
            width: `${skill.percent}%`,
            duration: 1.2,
            ease: 'power2.out'
          });
        });
      });
  
    // Load and Render Language Cards (flip reveal)
    fetch('assets/data/languages.json')
      .then(res => res.json())
      .then(languages => {
        const map = document.getElementById('languageMap');
        languages.forEach(lang => {
          const card = document.createElement('div');
          card.className = 'language-card';
          const backHTML = lang.countries.map(c => `
            <div class="country">
              <span class="flag">${c.flag}</span>
              <span class="name">${c.name}</span>
              <span class="capital">Capital: ${c.capital}</span>
              <span class="pop">Population: ${c.population.toLocaleString()}</span>
            </div>`).join('');
  
          card.innerHTML = `
            <div class="lang-inner">
              <div class="lang-front">
                <img src="${lang.icon}" alt="${lang.name}" width="48" />
              </div>
              <div class="lang-back">
                <strong>${lang.name}</strong>
                <p><strong>Total speakers:</strong> ${Number(lang["total speakers"]).toLocaleString()}</p>
                <p><strong>Native speakers:</strong> ${typeof lang["native speakers"] === 'string' ? lang["native speakers"] : Number(lang["native speakers"]).toLocaleString()}</p>
                <div class="country-list">${backHTML}</div>
              </div>
            </div>
          `;
          card.addEventListener('click', () => card.classList.toggle('flipped'));
          map.appendChild(card);
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%'
            },
            opacity: 0,
            y: 40,
            duration: 0.7,
            ease: 'power2.out'
          });
        });
      });
  
    // Scrollable Timeline – one item per view
    fetch('assets/data/timeline.json')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('timelineContainer');
        container.innerHTML = '';
        data.forEach((item, i) => {
          const div = document.createElement('div');
          div.className = 'timeline-item';
          div.innerHTML = `
            <img src="${item.icon}" alt="${item.title}" />
            <div class="timeline-content">
              <h3>${item.title}</h3>
              <p>${item.description}</p>
            </div>
          `;
          container.appendChild(div);
          gsap.from(div, {
            scrollTrigger: {
              trigger: div,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 60,
            duration: 0.8,
            ease: 'power3.out'
          });
        });
      });
  
    // Projects with Modal
    const modal = document.createElement('div');
    modal.id = 'projectModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <div class="modal-body"></div>
      </div>`;
    document.body.appendChild(modal);
  
    const modalContent = modal.querySelector('.modal-content');
    modal.querySelector('.modal-close').onclick = () => {
      gsap.to(modalContent, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => modal.classList.remove('show')
      });
    };
  
    function openProjectModal(project) {
      const modalBody = modal.querySelector('.modal-body');
      modalBody.innerHTML = `
        <h2>${project.title}</h2>
        <img src="${project.image}" alt="${project.title}" style="width:100%;border-radius:10px;margin-bottom:1rem;" />
        <p>${project.description}</p>
        <p><strong>Technologies:</strong> ${project.tech?.join(', ') || 'N/A'}</p>
      `;
      modal.classList.add('show');
      gsap.fromTo(modalContent, {
        y: 50,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  
    fetch('assets/data/projects.json')
      .then(res => res.json())
      .then(projects => {
        const container = document.getElementById('projectsContainer');
        projects.forEach((project, index) => {
          const div = document.createElement('div');
          div.className = 'project-item';
          div.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-thumb" />
            <div class="project-info">
              <h3>${project.title}</h3>
              <p>${project.description}</p>
            </div>
          `;
          div.onclick = () => openProjectModal(project);
          container.appendChild(div);
          gsap.from(div, {
            scrollTrigger: {
              trigger: div,
              start: 'top 85%'
            },
            y: 30,
            opacity: 0,
            duration: 0.5,
            delay: index * 0.1
          });
        });
      });
  });
  