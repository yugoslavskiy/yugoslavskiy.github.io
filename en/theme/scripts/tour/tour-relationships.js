//is the user doing a tour of the entire site, or just this module?
//this script runs on actor (groups), tool (software) and campaign pages;
//the story shown depends on the page type, the route is actor -> tool -> campaign
let isSiteTour = window.location.href.includes("?tour=true");

//tour texts are generated into settings.js (tour_strings) from data/translations.json
function T(key) { return (typeof tour_strings != 'undefined' && tour_strings[key]) || key; }

//popover template: ✕ in the top-right corner ends the tour (data-role='end'), bottom row keeps only prev/next
let tourTemplate = "<div class='popover' role='tooltip'><div class='arrow'></div>"
    + "<button type='button' class='close' data-role='end' aria-label='" + T("tour.btn.end") + "' title='" + T("tour.btn.end") + "' style='position:absolute;top:0.4rem;right:0.6rem;z-index:1;color:#fff;text-shadow:none;opacity:.75;'>&times;</button>"
    + "<h3 class='popover-header'></h3><div class='popover-body'></div>"
    + "<div class='popover-navigation'><div class='btn-group'>"
    + "<button class='btn btn-sm btn-outline-secondary' data-role='prev'>&laquo; " + T("tour.btn.prev") + "</button>"
    + "<button class='btn btn-sm btn-outline-secondary' data-role='next'>" + T("tour.btn.next") + " &raquo;</button>"
    + "</div></div></div>";

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
            element: ".breadcrumb a[href='/groups/']",
            placement: "bottom",
            backdrop: false,
            title: T("tour.group.sections.title"),
            content: T("tour.group.sections.content"),
        },
        //шаги идут сверху вниз по странице, чтобы тур не прыгал по краям
        {
            element: "#dropdownMenuButton",
            placement: "left",
            backdrop: false,
            title: T("tour.group.layers.title"),
            content: T("tour.group.layers.content"),
        },
        {
            element: "#techniques",
            placement: "top",
            backdrop: false,
            title: T("tour.group.techniques.title"),
            content: T("tour.group.techniques.content"),
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
            content: T("tour.software.techniques.content"),
        },
        {
            element: "#dropdownMenuButton",
            placement: "left",
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
            placement: "left",
            backdrop: false,
            title: T("tour.campaign.card.title"),
            content: T("tour.campaign.card.content"),
        },
        {
            element: "#dropdownMenuButton",
            placement: "left",
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
    showProgressBar: !isSiteTour,
    showProgressText: !isSiteTour,
    template: tourTemplate
})

function start_tour() {
    if (tour.ended()) tour.restart();
    else tour.start(true);
}

if (isSiteTour) {
    start_tour();
}
