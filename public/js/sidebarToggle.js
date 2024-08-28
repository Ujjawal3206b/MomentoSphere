
    document.addEventListener('DOMContentLoaded', function() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebarMenu = document.querySelector('.sidebar_menu');
        const mainContent = document.querySelector('.main_content');
        const footerBar = document.querySelector('.footer_bar');

        sidebarToggle.addEventListener('click', function() {
            sidebarMenu.classList.toggle('active');
            mainContent.classList.toggle('shifted');
            footerBar.classList.toggle('shifted');
        });
        
    });
    function showImageDetails(imageSrc, description,user) {
        document.getElementById('modal-image').src = 'data:image/png;base64,' + imageSrc;
        document.getElementById('image-user').textContent = "Uploaded by => id: " + user;
        document.getElementById('image-description').textContent = "At : " + description;
        document.getElementById('image-modal').style.display = 'block';
    }

    function closeImageModal() {
        document.getElementById('image-modal').style.display = 'none';
    }

