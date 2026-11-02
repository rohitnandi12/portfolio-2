# Rohit Nandi — Senior Software Developer & Certified Scrum PO

A high-performance portfolio website powered by a smooth scroll-driven frame animation (238 frames) playing continuously in the background, built around Rohit Nandi's curriculum vitae and 11+ years of software engineering experience.

## Section Order & Layout

1. **Dynamic Top Navigation Bar**:
   - **Initial State**: Rests transparently at the top of the hero with no fixed overlay or background.
   - **On Scroll**: Automatically locks as `position: fixed` at the top of the viewport when scrolling, sliding in with frosted glass (`backdrop-filter: blur(24px)`).
   - **On Return to Top**: Seamlessly transitions back to its transparent, non-fixed state.
2. **Hero Section (`#home`)**: Completely transparent background with wide-apart typography and open center space revealing the 238-frame scroll animation.
3. **SECTION 01: Skills & Technology Expertise (`#skills`)**:
   - Modern interactive Word Cloud featuring 3 typographic hierarchy tiers.
   - Dynamic hover effects: words illuminate, magnetic cursor scaling, and multi-layered neon glow on hover.
4. **SECTION 02: Featured Projects (`#projects`)**:
   - Spans edge-to-edge across the screen with **0 margin and 0 padding from the window**.
   - Displays a **single row of 4 reduced-size compact cards**:
     1. *Digital Gold & Payments Platform* (Muthoot FinCorp — Java 21, Cashfree)
     2. *Real-Time Event Streamer* (Target Corporation — Kafka, 90k+ rps)
     3. *Java 21 & Alloy Observability* (Trading Technologies — Platform Migration)
     4. *Neural Net & Lead Scoring* (Decisive.ai — PyTorch, Akka Streams)
   - Links directly to the full catalogue in `projects.html`.
5. **SECTION 03: Career History Timeline (`#experience`)**: Production milestones from 2015 to 2026.
6. **SECTION 04: Education & Certifications (`#education`)**: Academic degree (B.Tech, 8.12 DGPA), CSPO, and hackathons.
7. **SECTION 05: Contact CTA Footer (`#about`)**: Direct email, phone, and location links.

---

## Dedicated Projects Catalogue (`projects.html`)

- Real-time search bar at the top (filters by project title, client, description, or tech).
- Left filter sidebar with multi-select checkboxes by domain, technology, and scale.
- 8 detailed project cards with visual previews and an interactive lightbox modal.

---

## How to Run

### Direct Browser Open
Open [index.html](file:///d:/github/no-code-portfolio/index.html) or [projects.html](file:///d:/github/no-code-portfolio/projects.html) in any browser.

### Local Server
```bash
# Using Node.js
npx serve .

# Using Python
python -m http.server 3000
```
Visit `http://localhost:3000`.
