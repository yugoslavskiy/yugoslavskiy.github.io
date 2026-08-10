//is the user doing a tour of the entire site, or just this module?
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

function hide_prev_on_site_tour() { //the previous tour page is another module: "back" can not go there
    if (isSiteTour) $(".popover [data-role='prev']").hide();
}

//first defined step of the route that exists on this site
function next_stop(keys) {
    for (let i = 0; i < keys.length; i++) {
        if (typeof tour_steps[keys[i]] != 'undefined') return tour_steps[keys[i]];
    }
    return null;
}

//mirrors the examples filter logic: it is shown when the example rows cover 2+ peoples
let examplePeoples = new Set();
document.querySelectorAll('#techProcs .procedure-row').forEach(function(r) {
    (r.dataset.platforms || '').split(',').forEach(function(p) {
        if (p.trim()) examplePeoples.add(p.trim());
    });
});
let examplesContent = T("tour.techniques.examples.base")
    + " " + (examplePeoples.size >= 2
        ? T("tour.techniques.examples.multi")
        : T("tour.techniques.examples.single"))
    + " " + T("tour.techniques.examples.outro");

let tourSteps = [
    {
        orphan: true,
        backdrop: false,
        title: T("tour.techniques.intro.title"),
        content: T("tour.techniques.intro.content"),
        onShown: hide_prev_on_site_tour
    },
    {
        element: "#card-tactics",
        placement: "left",
        backdrop: false,
        title: T("tour.techniques.tactics.title"),
        content: T("tour.techniques.tactics.content"),
    },
    {
        element: "#card-platforms",
        placement: "left",
        backdrop: false,
        title: T("tour.techniques.peoples.title"),
        content: T("tour.techniques.peoples.content"),
    },
    {
        element: "#examples",
        placement: "top",
        backdrop: false,
        title: T("tour.techniques.examples.title"),
        content: examplesContent,
    }
]

let techniqueNext = next_stop(['group', 'software', 'campaign']);
if (isSiteTour && techniqueNext) tourSteps.push({
    onShow: function() { //go to the next tour module
        window.location.href = base_url + techniqueNext + "/?tour=true"
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
