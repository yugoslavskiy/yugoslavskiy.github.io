//is the user doing a tour of the entire site, or just this module?
//this script runs on actor (groups), tool (software) and campaign pages;
//the story shown depends on the page type, the route is actor -> tool -> campaign
let isSiteTour = window.location.href.includes("?tour=true");

//tour texts are generated into settings.js (tour_strings) from data/translations.json
function T(key) { return (typeof tour_strings != 'undefined' && tour_strings[key]) || key; }

//popover template: the cross in the top-right corner ends the tour (data-role='end'), bottom row keeps prev/next;
//on the last step, where there is no "next", the row shows the closing button instead.
//Looks (surface, type, buttons, icons) live in style-dc.css, section "подсказки экскурсии"; icons are CSS masks,
//because the popover sanitizer strips svg from the template.
let tourTemplate = "<div class='popover dc-tour' role='tooltip'><div class='arrow'></div>"
    + "<button class='dc-tour-x' data-role='end' aria-label='" + T("tour.btn.end") + "'></button>"
    + "<h3 class='popover-header'></h3><div class='popover-body'></div>"
    + "<div class='popover-navigation'>"
    + "<button class='dc-tour-prev' data-role='prev'>" + T("tour.btn.prev") + "</button>"
    + "<button class='dc-tour-next' data-role='next'>" + T("tour.btn.next") + "</button>"
    + "<button class='dc-tour-end' data-role='end'>" + T("tour.btn.end") + "</button>"
    + "</div></div>";

//step counter of a single-page tour: "2 / 4" next to the title, instead of the library's striped bar
function tourProgressText(i, percent, count) { return "<span class='dc-tour-n'>" + (i + 1) + " / " + count + "</span>"; }

//on a narrow screen list rows lose their right-hand column (the counter): a text that mentions it
//may have a second version there, the same key + ".narrow"
let tourNarrow = window.matchMedia("(max-width: 767px)").matches;
function TN(key) { return (tourNarrow && typeof tour_strings != 'undefined' && tour_strings[key + ".narrow"]) || T(key); }

//targets sit in the centred column: beside it there is room only on a wide window
let tourSide = window.matchMedia("(min-width: 1500px)").matches ? "left" : "bottom";

//first defined step of the route that exists on this site
function next_stop(keys) {
    for (let i = 0; i < keys.length; i++) {
        if (typeof tour_steps[keys[i]] != 'undefined') return tour_steps[keys[i]];
    }
    return null;
}

let tourPath = window.location.pathname;
let pageType = tourPath.indexOf("/groups/") != -1 ? "group"
    : tourPath.indexOf("/software/") != -1 ? "software"
    : "campaign";

function hide_prev_on_site_tour() { //the previous tour page is another module: "back" can not go there
    if (isSiteTour) $(".popover [data-role='prev']").hide();
}

let tourSteps = [];

if (pageType == "group") {
    tourSteps.push(
        {
            orphan: true,
            backdrop: false,
            title: T("tour.group.intro.title"),
            content: T("tour.group.intro.content"),
            onShown: hide_prev_on_site_tour
        },
        {
            element: ".dc-crumbs a[href$='/groups/']",
            placement: "bottom",
            backdrop: false,
            title: T("tour.group.sections.title"),
            content: T("tour.group.sections.content"),
        },
        //шаги идут сверху вниз по странице, чтобы тур не прыгал по краям
        {
            element: "#dropdownMenuButton",
            placement: tourSide,
            backdrop: false,
            title: T("tour.group.layers.title"),
            content: T("tour.group.layers.content"),
        },
        {
            element: "#techniques",
            placement: "top",
            backdrop: false,
            title: T("tour.group.techniques.title"),
            content: TN("tour.group.techniques.content"),
        },
        {
            element: "#procedures",
            placement: "top",
            backdrop: false,
            title: T("tour.group.procedures.title"),
            content: T("tour.group.procedures.content"),
        }
    );
} else if (pageType == "software") {
    tourSteps.push(
        {
            orphan: true,
            backdrop: false,
            title: T("tour.software.intro.title"),
            content: T("tour.software.intro.content"),
            onShown: hide_prev_on_site_tour
        },
        {
            element: "#techniques",
            placement: "top",
            backdrop: false,
            title: T("tour.software.techniques.title"),
            content: TN("tour.software.techniques.content"),
        },
        {
            element: "#dropdownMenuButton",
            placement: tourSide,
            backdrop: false,
            title: T("tour.software.layers.title"),
            content: T("tour.software.layers.content"),
        }
    );
} else {
    tourSteps.push(
        {
            orphan: true,
            backdrop: false,
            title: T("tour.campaign.intro.title"),
            content: T("tour.campaign.intro.content"),
            onShown: hide_prev_on_site_tour
        },
        {
            element: "#card-id",
            placement: "bottom",
            backdrop: false,
            title: T("tour.campaign.card.title"),
            content: T("tour.campaign.card.content"),
        },
        {
            element: "#dropdownMenuButton",
            placement: tourSide,
            backdrop: false,
            title: T("tour.campaign.layers.title"),
            content: T("tour.campaign.layers.content"),
        },
        {
            element: "#procedures",
            placement: "top",
            backdrop: false,
            title: T("tour.campaign.procedures.title"),
            content: T("tour.campaign.procedures.content"),
        },
        {
            orphan: true,
            backdrop: false,
            title: T("tour.campaign.end.title"),
            content: T("tour.campaign.end.content"),
        }
    );
}

let relationshipsNextKeys = pageType == "group" ? ['software', 'campaign']
    : pageType == "software" ? ['campaign']
    : [];
let relationshipsNext = next_stop(relationshipsNextKeys);
if (isSiteTour && relationshipsNext) tourSteps.push({
    onShow: function() { //go to the next tour module
        window.location.href = base_url + relationshipsNext + "/?tour=true"
    }
})

let tour = new Tour({
    container: "#tab-content",
    steps: tourSteps,
    container: "#v-tabContent",
    storage: false, //no resuming tour if the page is reloaded.
    framework: 'bootstrap4',   // set Tourist to use BS4 compatibility
    showProgressBar: false,
    showProgressText: !isSiteTour,
    getProgressTextHTML: tourProgressText,
    template: tourTemplate
})

function start_tour() {
    if (tour.ended()) tour.restart();
    else tour.start(true);
}

if (isSiteTour) {
    start_tour();
}
