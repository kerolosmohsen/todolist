// ===== PERFORMANCE & LAZY LOADING =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== MENU TOGGLE =====
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
    menu.classList.toggle("active");
});

// Close menu when a link is clicked
document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
    });
});

// ===== ACCREDITATION CARDS INTERACTION =====
const boxes = document.querySelectorAll(".orouba");

boxes.forEach(box => {
    box.addEventListener("click", () => {
        boxes.forEach(b => b.classList.remove("active"));
        box.classList.add("active");
    });
});

// ===== COURSE CARDS INTERACTION =====
const courses = document.querySelectorAll(".courses");

courses.forEach(course => {
    course.addEventListener("click", () => {
        courses.forEach(c => c.classList.remove("active"));
        course.classList.add("active");
    });
});

// ===== BUTTON INTERACTIONS =====

// Welcome Button - Scroll to About
const btnWelcome = document.getElementById("btn-welcome");
if (btnWelcome) {
    btnWelcome.addEventListener("click", () => {
        document.getElementById("about").scrollIntoView({ behavior: "smooth" });
    });
}

// Accreditations Button - Scroll to Accreditations
const btnAccreditations = document.getElementById("btn-accreditations");
if (btnAccreditations) {
    btnAccreditations.addEventListener("click", () => {
        document.getElementById("accreditation").scrollIntoView({ behavior: "smooth" });
    });
}

// Explore Button
const btnExplore = document.getElementById("btn-explore");
if (btnExplore) {
    btnExplore.addEventListener("click", (e) => {
        // Keep the default link behavior
    });
}

// ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href && href !== "#") {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        }
    });
});

// ===== ADD VISUAL FEEDBACK ON BUTTON CLICKS =====
document.querySelectorAll("button, .btn").forEach(button => {
    button.addEventListener("mousedown", function() {
        this.style.transform = "scale(0.98)";
    });
    
    button.addEventListener("mouseup", function() {
        this.style.transform = "scale(1)";
    });
    
    button.addEventListener("mouseleave", function() {
        this.style.transform = "scale(1)";
    });
    
    // Touch support for mobile
    button.addEventListener("touchstart", function() {
        this.style.transform = "scale(0.98)";
    });
    
    button.addEventListener("touchend", function() {
        this.style.transform = "scale(1)";
    });
});

// ===== ACTIVE LINK HIGHLIGHTING =====
window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section, div[id]");
    const navLinks = document.querySelectorAll(".menu a");
    
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 150) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href").slice(1) === current) {
            link.classList.add("active");
        }
    });
});

// ===== ADD RIPPLE EFFECT ON CLICK =====
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.classList.add("ripple");

    // Remove old ripples
    const ripples = button.getElementsByClassName("ripple");
    if (ripples[0]) {
        ripples[0].remove();
    }

    button.appendChild(ripple);
}

// ===== ENHANCE LINKS AND BUTTONS =====
const allLinks = document.querySelectorAll("a, button, .btn");
allLinks.forEach(link => {
    link.addEventListener("click", createRipple);
});

// ===== REGISTER SERVICE WORKER FOR PWA =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('Service Worker registered:', registration);
        }, function(err) {
            console.log('Service Worker registration failed:', err);
        });
    });
}

// ===== PAGE VISIBILITY API =====
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page is hidden');
    } else {
        console.log('Page is visible');
    }
});


