document.addEventListener('DOMContentLoaded', function() {
    // Set up button click handlers
    document.getElementById('debates-button').addEventListener('click', function() {
        window.location.href = 'debates/index.html';
    });
    
    document.getElementById('arguments-button').addEventListener('click', function() {
        window.location.href = 'arguments/index.html';
    });
    
    document.getElementById('research-button').addEventListener('click', function() {
        window.location.href = 'research/index.html';
    });
    
    document.getElementById('profile-button').addEventListener('click', function() {
        window.location.href = 'profile/index.html';
    });
    
    // Add hover sound effect for buttons
    const hubButtons = document.querySelectorAll('.hub-button');
    
    hubButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            // You can add sound effects here if desired
            // For example: new Audio('hover.mp3').play();
            
            // Add a subtle visual feedback
            button.style.transition = 'all 0.2s ease';
        });
    });
    
    // Welcome message in console for developers
    console.log('CrossDebate Panel Hub loaded successfully');
});
