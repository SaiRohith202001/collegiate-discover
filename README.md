# Campus Connect

Build a Premium College Event Management Platform

Create a modern, premium, production-quality College Event Management Web Application.

The application will be used as the central project for teaching DevOps to B.Tech CSE students.

The project will eventually evolve through:

Frontend → Backend → Database → Monolithic Architecture → Docker → CI/CD → Cloud → Kubernetes → Microservices → Monitoring.

For the current phase, build ONLY THE FRONTEND/UI.

Keep the product functionally SIMPLE but visually PREMIUM.

1. PRODUCT PURPOSE

This is NOT a ticket-booking application.

This is a college event discovery and registration platform.

Students should be able to open the website and discover events happening inside their college.

Examples:

Hackathons

Coding Contests

Technical Quizzes

Workshops

Seminars

Paper Presentations

Project Expos

Robotics Events

Gaming Events

Cultural Events

Sports Events

Photography

Debates

The main user journey must remain extremely simple:

HOME

↓

DISCOVER EVENTS

↓

VIEW EVENT

↓

REGISTER

↓

REGISTRATION CONFIRMED

↓

MY REGISTRATIONS

Do not unnecessarily complicate this flow.

2. DESIGN QUALITY

The most important requirement is UI QUALITY.

Take inspiration from the visual quality and user experience principles of premium consumer discovery applications such as District.

The application should feel:

Premium

Modern

Youthful

Energetic

Minimal

Smooth

Professional

Visually engaging

Fast

Mobile friendly

Do NOT copy District's:

Logo

Branding

Exact layouts

Images

Text

Icons

Proprietary assets

Create an original college event platform with similar attention to visual quality.

It should NOT look like:

A college mini project

A basic CRUD website

An ERP portal

An admin dashboard

A Bootstrap template

A generic Tailwind website

It should look like a modern startup product.

3. APPLICATION NAME

Use:

CAMPUSLY

Tagline:

Discover. Participate. Experience.

Supporting text:

"Everything happening on your campus, in one place."

Keep the branding modular so the application can easily be renamed later.

4. TECHNOLOGY

Build using:

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Lucide Icons

Use clean reusable React components.

No backend yet.

No database yet.

No Supabase.

No Firebase.

No payment integration.

Use mock data only.

5. VISUAL DIRECTION

Create a premium consumer-app aesthetic.

Use:

Large event imagery

Beautiful event cards

Generous whitespace

Strong typography

Rounded corners

Subtle shadows

Minimal borders

Modern icons

Smooth hover interactions

Clean animations

Excellent spacing

Strong visual hierarchy

Use a mostly neutral/light interface with one strong accent color.

Avoid excessive gradients.

Avoid excessive animations.

Avoid making everything look like cards.

Keep the interface elegant and spacious.

6. NAVIGATION

Desktop navbar:

LEFT:

CAMPUSLY logo

CENTER:

Home

Explore

Categories

RIGHT:

Search

My Registrations

Profile

Keep navigation minimal.

Mobile navigation:

Home

Explore

Registrations

Profile

Use a premium sticky bottom navigation for mobile.

7. HOME PAGE

The homepage should immediately make students want to explore campus events.

Hero heading:

What's happening on campus?

Supporting text:

"Discover hackathons, workshops, competitions, cultural events and everything happening around you."

Add a large search field:

"Search events, clubs or activities..."

Do NOT make the hero excessively tall.

Users should be able to see event content without scrolling too far.

8. FEATURED EVENT

Immediately below the hero create ONE premium featured-event banner.

Example:

CODESTORM 2026

24-Hour National Level Hackathon

Department of Computer Science & Engineering

August 29–30

Main Auditorium

[View Event]

Use a large cinematic event image.

This should be one of the visually strongest elements on the homepage.

9. EVENT CATEGORIES

Create a simple horizontal category selector.

Categories:

All

Hackathons

Coding

Quiz

Workshops

Technical

Cultural

Sports

Gaming

Clubs

Keep category UI minimal.

Use small icons where appropriate.

On mobile make this horizontally scrollable.

10. TRENDING EVENTS

Create section:

Trending on Campus

Display premium event cards.

Example events:

CodeStorm 2026

AI Innovation Hackathon

Web Development Workshop

Tech Trivia Challenge

Battle of Algorithms

Robotics Challenge

Photography Contest

Campus Esports Championship

Cultural Night

Startup Pitch Challenge

Use realistic college event data.

11. EVENT CARD

This component is extremely important.

Design a premium event card.

EVENT IMAGE

Then:

Category badge

Event title

Date

Time

Venue

Department / Club

Example:

HACKATHON

AI Innovation Challenge

Aug 28 · 9:00 AM

Innovation Lab

CSE Department

CTA:

View Event

Optional secondary information:

"124 students registered"

Cards should have subtle hover interactions.

On hover:

slightly enlarge image

increase card elevation

reveal CTA more prominently

Do NOT over-animate.

12. UPCOMING EVENTS

Create another section:

Upcoming Events

Show events ordered by date.

Include:

Today

Tomorrow

This Week

This Month

Keep the date filtering UI simple.

13. EXPLORE PAGE

Create:

Explore Events

Top search:

"Search events..."

Filters:

All

Hackathons

Coding

Quiz

Workshops

Cultural

Sports

Gaming

Optional filter:

Today

Tomorrow

This Week

Do NOT create complicated filtering.

The purpose is event discovery.

Display events in a responsive grid.

Desktop:

3–4 cards per row depending on screen width.

Tablet:

2–3 cards.

Mobile:

1–2 depending on available width.

14. SEARCH

Clicking search should open a polished search interface.

Search:

"Search events, clubs or activities"

Show:

Trending Searches

Hackathon

Coding

AI

Quiz

Workshop

Sports

Search results should filter mock events.

Create a clean no-result state:

"No events found."

"Try searching for another event or category."

15. EVENT DETAILS PAGE

This is the most important page after the homepage.

Create a visually premium event details page.

TOP:

Large event cover image.

Below:

Category

Event Title

Example:

AI Innovation Hackathon 2026

Department of Computer Science & Engineering

Display clearly:

Date

Time

Venue

Organized By

Registration Deadline

Team Size

Example:

Date
August 28, 2026

Time
9:00 AM – 6:00 PM

Venue
Innovation Lab

Organized By
CSE Department

Registration Deadline
August 25

Team Size
2–4 Members

16. ABOUT EVENT

Create:

About This Event

Example content:

"Build innovative solutions using Artificial Intelligence and compete with some of the brightest minds on campus."

Keep descriptions readable.

Do not create huge paragraphs.

17. EVENT DETAILS

Create sections:

Event Highlights

Example:

24-Hour Hackathon

Mentorship Sessions

Team Participation

Certificates

Exciting Challenges

Rules

Example:

Teams must contain 2–4 members.

Participants must carry college ID.

All development must happen during the event.

Eligibility

Open to all engineering students.

Venue

Innovation Lab

Block A

College Campus

18. REGISTRATION CTA

This is the primary action of the entire application.

Create a highly visible:

Register Now

button.

Desktop:

Create a clean sticky registration panel on the right.

Example:

Registration closes

August 25

124 students already registered

[REGISTER NOW]

Mobile:

Sticky bottom section:

Registration Open

[REGISTER NOW]

No payment.

No ticket selection.

No complicated checkout.

One simple registration.

19. EVENT REGISTRATION

When Register Now is clicked:

Open a clean registration page/modal.

Heading:

Register for AI Innovation Hackathon

Fields:

Full Name

Student ID / Roll Number

Email

Phone Number

Department

Year

For team events:

Team Name

Team Members

For individual events do not show team fields.

CTA:

Confirm Registration

Keep the registration form very simple.

20. REGISTRATION SUCCESS

After registration show a premium success screen.

Success icon/animation.

You're Registered!

Supporting message:

"Your spot for AI Innovation Hackathon has been confirmed."

Show:

Event

Date

Time

Venue

Registration ID

Example:

REG-CSE-2026-0182

Buttons:

View My Registrations

Explore More Events

No ticket.

No payment.

No unnecessary booking flow.

21. MY REGISTRATIONS

Create page:

My Registrations

Tabs:

Upcoming

Completed

Display registration cards.

Example:

AI Innovation Hackathon

Aug 28

Innovation Lab

Registration ID

REG-CSE-2026-0182

Status:

REGISTERED

Button:

View Event

Allow:

Cancel Registration

Use mock frontend functionality for now.

22. PROFILE

Keep profile simple.

Profile picture

Student Name

Student ID

Department

Year

Email

Sections:

My Registrations

Saved Events

Account Settings

Logout

Do not overbuild the profile system.

23. FAVORITES

Allow students to save events using a heart/bookmark icon.

Create:

Saved Events

Display bookmarked events.

If empty:

"No saved events yet."

"Save events you're interested in and find them here."

24. RESPONSIVE EXPERIENCE

The website must feel excellent on:

Desktop

Laptop

Tablet

Mobile

Especially optimize for mobile because students will likely access events using their phones.

Mobile should feel similar to a premium native application.

Use:

Sticky bottom navigation

Horizontal category scrolling

Large touch targets

Readable event cards

Sticky Register button

25. MOCK DATA

Create event mock data separately.

DO NOT hard-code data inside components.

Example structure:

src/
components/
pages/
data/
services/
types/
hooks/
layouts/
utils/

Create:

src/data/events.ts

Create Event interface.

Example:

Event

id

title

description

category

image

date

time

venue

department

organizer

registrationDeadline

maxParticipants

registeredParticipants

teamSize

eligibility

rules

status

26. API-READY STRUCTURE

This requirement is VERY IMPORTANT.

The frontend will later connect to a backend built manually by students.

Therefore create:

src/services/eventService.ts

src/services/registrationService.ts

src/services/userService.ts

For now these services should work with mock data.

Later we should be able to replace:

Mock Service

with:

REST API

without changing the UI components.

Keep UI and data logic separated.

27. ROUTES

Use clean routes:

/

/events

/events/:id

/register/:eventId

/registrations

/saved

/profile

Keep routing SIMPLE.

Do not create unnecessary pages.

28. FRONTEND INTERACTIONS

Buttons should work using frontend mock state.

Implement:

Search events

Filter categories

Save event

Unsave event

Register event

Cancel registration

View registration

Update registration count

Show registration confirmation

Do not leave dead buttons.

29. LOADING STATES

Create simple skeleton loaders for:

Event cards

Event details

Registrations

Search

30. EMPTY STATES

Create attractive empty states.

Examples:

No registrations:

"You haven't registered for any events yet."

[Explore Events]

No saved events:

"Nothing saved yet."

[Discover Events]

No search result:

"No events matched your search."

31. DEVOPS PROJECT REQUIREMENT

This application will later be used to teach DevOps.

Therefore keep the initial application intentionally simple.

The final architecture will evolve through multiple stages.

DO NOT implement those stages now.

The intended learning journey is:

CAMPUSLY FRONTEND

↓

MONOLITHIC BACKEND

↓

DATABASE

↓

VERSION CONTROL

↓

TESTING

↓

DOCKER

↓

CI/CD

↓

CLOUD DEPLOYMENT

↓

MONITORING

↓

KUBERNETES

↓

MICROSERVICES

Students should experience how a simple application evolves into a production system.

32. FUTURE MONOLITH ARCHITECTURE

Eventually the application will use:

React Frontend

↓

REST API

↓

Backend Monolith

↓

Database

Potential backend modules:

Authentication

Users

Events

Registrations

Notifications

DO NOT implement them now.

Only structure the frontend so these modules can later connect easily.

33. FUTURE MICROSERVICES

Later in the DevOps course the monolith may be decomposed into:

API Gateway

↓

Auth Service

Event Service

Registration Service

User Service

Notification Service

↓

Databases / Messaging

DO NOT implement microservices now.

This information is only provided so the frontend architecture remains compatible with future development.

34. IMPORTANT SIMPLICITY RULE

DO NOT OVERENGINEER THIS APPLICATION.

The main purpose is:

Discover → View → Register → Confirmation

That is it.

Avoid:

Payments

Tickets

Seat selection

Complex dashboards

Chat

Social feeds

Event recommendations using AI

Complex authentication

Complex organizer dashboards

Complex analytics

Maps

Unnecessary features

The UI should be PREMIUM.

The FUNCTIONALITY should be SIMPLE.

35. QUALITY TARGET

Imagine this application being demonstrated to 3rd-year CSE students on a projector.

The first reaction should be:

"This looks like a real application."

Not:

"This looks like another college project."

Prioritize:

Premium UI

Event imagery

Excellent typography

Smooth event discovery

Beautiful event cards

Simple registration

Responsive design

Clean architecture

Reusable components

API-ready frontend

FINAL INSTRUCTION

Build the complete frontend.

Do not stop after the landing page.

Complete these screens:

HOME

EXPLORE EVENTS

EVENT DETAILS

EVENT REGISTRATION

REGISTRATION SUCCESS

MY REGISTRATIONS

SAVED EVENTS

PROFILE

404

Use realistic college event mock data throughout.

The final product should be visually comparable in quality to modern premium consumer applications while remaining an original design.

Remember the fundamental principle:

SIMPLE PRODUCT. PREMIUM EXPERIENCE.

The application's main job is simply:

Help students discover campus events and register for them.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4b1aeb22-a4dd-4d72-99bc-a75ec12c6dde).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
