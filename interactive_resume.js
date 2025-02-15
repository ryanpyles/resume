document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-fade-in, .scroll-slide-in').forEach(section => observer.observe(section));

  const carousel = document.querySelector('.project-carousel');
  if (carousel) {
    let startX = 0, currentIndex = 0, projects = document.querySelectorAll('.project-item');
    if (projects.length) {
      carousel.addEventListener('touchstart', e => startX = e.touches[0].clientX);
      carousel.addEventListener('touchend', e => {
        let endX = e.changedTouches[0].clientX;
        requestAnimationFrame(() => {
          currentIndex = (startX - endX > 50) ? (currentIndex + 1) % projects.length : (endX - startX > 50) ? (currentIndex - 1 + projects.length) % projects.length : currentIndex;
          carousel.scrollTo({ left: projects[currentIndex].offsetLeft, behavior: 'smooth' });
        });
      });
    }
  }

  ['./hero.png', './translator.png', './norse.png'].forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src; img.alt = `Project Image ${i + 1}`; img.loading = 'lazy';
    img.width = 300;  // Set smaller image width
    img.height = 200; // Set smaller image height
    img.classList.add('project-image');
    document.querySelectorAll('.project-item')[i]?.prepend(img);
  });

  window.addEventListener('scroll', () => requestAnimationFrame(() => {
    const hero = document.getElementById('hero');
    if (hero) hero.style.backgroundPositionY = `${window.scrollY * 0.5}px`;
  }));

  document.getElementById('dark-mode-toggle')?.addEventListener('click', () => requestAnimationFrame(() => document.body.classList.toggle('dark-mode')));
});
