function notificationToggle() {
    var notification = document.getElementById("notification");
    notification.classList.toggle("active");
}

function showDialog() {
    var dialog = document.getElementById("dialog-container");
    if (dialog.style.display === "none") {
        dialog.style.display = "block";
    } else {
        dialog.style.display = "none";
    }
}

function notificationFunc() {
    var notification = document.getElementById("notification");
    if (notification.classList.contains('active')) {
        toggleDialog();
        notificationToggle();
    }
}

function toggleDialog() {
    var dialog = document.getElementById("dialog-container");
    if (dialog.style.display === "none") {
        dialog.style.display = "block";
    } else {
        dialog.style.display = "none";
    }
}

function toggleInventory() {
    var inventory = document.getElementById("inventory-container");
    var inventory_icon = document.getElementById("inventory");

    inventory_icon.classList.remove("wiggle");
    if (inventory.style.display === "none") {
        inventory.style.display = "block";
    } else {
        inventory.style.display = "none";
    }
}

function toggleHelp() {
    var help = document.getElementById("help-container");
    if (help.style.display === "none") {
        help.style.display = "block";
    } else {
        help.style.display = "none";
    }
}
