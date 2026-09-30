(() => {
    "use strict";

    const body = document.body;
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-img");
    const record = document.querySelector(".disc-img");
    let lastFocusedElement = null;

    function openLightbox(item) {
        const image = item && item.querySelector("img");
        if (!image || !lightbox || !lightboxImage) return;

        lastFocusedElement = document.activeElement;
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || "Expanded portfolio artwork";
        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
        lightbox.querySelector(".lightbox-close")?.focus();
    }

    function closeLightbox() {
        if (!lightbox || !lightboxImage) return;

        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.removeAttribute("src");
        body.style.overflow = "";
        lastFocusedElement?.focus?.();
    }

    // The existing HTML calls these functions from its artwork click handlers.
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;

    window.addEventListener("load", () => {
        body.classList.add("loaded");
    }, { once: true });

    function spinRecord() {
        if (!record || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        record.classList.remove("spin-once");
        void record.offsetWidth;
        record.classList.add("spin-once");
    }

    record?.addEventListener("click", spinRecord);
    record?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        spinRecord();
    });
    record?.addEventListener("animationend", (event) => {
        if (event.animationName === "vinyl-spin") record.classList.remove("spin-once");
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && lightbox?.classList.contains("active")) {
            closeLightbox();
        }
    });

    // Fade project cards in as they enter view; leave them visible on older browsers.
    const revealItems = document.querySelectorAll(
        ".sem-item, .work-item, .info-card, .skill-card"
    );

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, activeObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                activeObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08 });

        revealItems.forEach((item) => {
            item.classList.add("reveal-on-scroll");
            observer.observe(item);
        });
    }

    // Place the portfolio letters along the vinyl image's upper circular rim.
    const letters = document.querySelectorAll(".curved-text span");

    function arrangeCurvedTitle() {
        if (!letters.length || !record || !record.naturalWidth) return;

        const recordBounds = record.getBoundingClientRect();
        const textBounds = document.querySelector(".curved-text").getBoundingClientRect();
        const radius = recordBounds.width * 0.58;
        const circleCenterY = recordBounds.height + recordBounds.width * 0.005;
        const maxAngle = window.innerWidth < 480 ? 90 : 120;
        const startAngle = -maxAngle / 2;
        const angleStep = letters.length > 1
            ? maxAngle / (letters.length - 1)
            : 0;

        letters.forEach((letter, index) => {
            const angle = startAngle + angleStep * index;
            const radians = angle * Math.PI / 180;
            const x = recordBounds.left - textBounds.left + recordBounds.width / 2
                + radius * Math.sin(radians);
            const y = recordBounds.top - textBounds.top + circleCenterY
                - radius * Math.cos(radians);

            letter.style.left = `${x}px`;
            letter.style.top = `${y}px`;
            letter.style.bottom = "auto";
            letter.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        });
    }

    arrangeCurvedTitle();
    record?.addEventListener("load", arrangeCurvedTitle, { once: true });
    window.addEventListener("resize", arrangeCurvedTitle, { passive: true });
})();
