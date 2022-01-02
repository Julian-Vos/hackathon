function notificationToggle() {
    var notification = document.getElementById("notification");
    notification.classList.remove("active");
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
    if (notification.classList.contains('openable')) {
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
    var dialog = document.getElementById("inventory-container");
    if (dialog.style.display === "none") {
        dialog.style.display = "block";
    } else {
        dialog.style.display = "none";
    }
}

function toggleHelp() {
    var dialog = document.getElementById("help-container");
    if (dialog.style.display === "none") {
        dialog.style.display = "block";
    } else {
        dialog.style.display = "none";
    }
}
