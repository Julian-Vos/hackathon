var dots = window.setInterval( function() {
var wait = document.getElementById("wait");
if ( wait.innerHTML.length > 2 )
    wait.innerHTML = "";
else
    wait.innerHTML += ".";
}, 500);

function notificationToggle() {
    var notification = document.getElementById("notification");
    notification.classList.remove("active");
}

function notificationFunc() {
    var notification = document.getElementById("notification");
    if (notification.classList.contains('openable')) {
        toggleDialog();
        notificationToggle();
    }
}

function toggleDialog() {
    var dialog = document.getElementById("dialog-container");
    if (dialog.style.display === "none") {
        dialog.style.display = "block";
        sounds.menu_open.play();

        setTimeout(function() {
            sounds.typewriter.play();
        }, 250);
        setTimeout(function() {
            sounds.typewriter.play();
        }, 4490);

    } else {
        dialog.style.display = "none";
        sounds.menu_close.play();
    }
}

function toggleInventory() {
    var inventory = document.getElementById("inventory-container");
    var inventory_icon = document.getElementById("inventory");

    inventory_icon.classList.remove("wiggle");
    if (inventory.style.display === "none") {
        inventory.style.display = "block";
        sounds.menu_open.play();

        setTimeout(function() {
            sounds.typewriter.play();
        }, 250);
    } else {
        inventory.style.display = "none";
        sounds.menu_close.play();
    }
}

function toggleHelp() {
    var help = document.getElementById("help-container");
    if (help.style.display === "none") {
        help.style.display = "block";
        sounds.menu_open.play();

        setTimeout(function() {
            sounds.typewriter.play();
        }, 250);
        setTimeout(function() {
            sounds.typewriter.play();
        }, 4490);
    } else {
        help.style.display = "none";
        sounds.menu_close.play();
    }
}

function onMouseEnter(element) {
    if (element.classList.contains('show')) { // reuse for next button
        sounds.mouse_over_effect_short.play();
    }
}

function kittenPurr() {
    sounds.criminal_cat_meow.play();
}

function gameStartSound() {
    sounds.starting_game.play();
}
