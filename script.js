// script.js for index.html
document.addEventListener('DOMContentLoaded', () => {
  const openBuilderBtn = document.getElementById('openBuilderBtn');
  if (openBuilderBtn) {
    openBuilderBtn.addEventListener('click', () => {
      window.location.href = 'builder.html';
    });
  }
});
