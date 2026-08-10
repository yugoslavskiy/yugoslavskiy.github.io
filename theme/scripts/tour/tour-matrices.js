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

//stubs: the matrix template wires these onto the highlighted example cell
function tour_technique_clicked() {}
function tour_layout_clicked() {}

let tourSteps = [
    {
        orphan: true,
        backdrop: false,
        title: T("tour.matrices.intro.title"),
        content: T("tour.matrices.intro.content"),
        onShow: function() {
            showMatrix("side");
        },
        onShown: hide_prev_on_site_tour
    },
    {
        element: "table.matrix.side td.tactic.name:first", //:first — popover attaches to EVERY matched element
        placement: "bottom",
        backdrop: false,
        title: T("tour.matrices.tactics.title"),
        content: T("tour.matrices.tactics.content"),
        onShow: function() {
            showMatrix("side");
        }
    },
    {
        element: "table.matrix.side .technique-cell:first", //:first — popover attaches to EVERY matched element
        placement: "right",
        backdrop: false,
        title: T("tour.matrices.techniques.title"),
        content: T("tour.matrices.techniques.content"),
        onShow: function() {
            showMatrix("side");
        }
    },
    {
        element: "#matrix-navigator-link",
        placement: "right",
        backdrop: false,
        title: T("tour.matrices.navigator.title"),
        content: T("tour.matrices.navigator.content")
    }
]

if (isSiteTour && typeof tour_steps['technique'] != 'undefined') tourSteps.push({
    onShow: function() { //go to the next tour module
        window.location.href = base_url + tour_steps['technique'] + "/?tour=true"
    }
})

let tour = new Tour({
    steps: tourSteps,
    container: "#tour-matrix-container",
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
