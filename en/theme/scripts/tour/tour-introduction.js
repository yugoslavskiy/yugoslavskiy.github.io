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

let tour = new Tour({
    storage: false, //no resuming tour if the page is reloaded.
    framework: 'bootstrap4',   // set Tourist to use BS4 compatibility
    showProgressBar: false,
    showProgressText: false,
    template: tourTemplate
})

if (typeof tour_steps['matrix'] != 'undefined'){
    tour['_options']['steps'] = [
        {
            container: "#tour-start-container",
            element: "#tour-start",
            placement: "bottom",
            title: T("tour.intro.title"),
            content: T("tour.intro.content"),
        },
        {
            onShow: function() { //go to the next tour module
                window.location.href = base_url + tour_steps['matrix'] + "/?tour=true"
            }
        }
    ]
}
else{
    tour['_options']['steps'] = [
        {
            container: "#tour-start-container",
            element: "#tour-start",
            placement: "bottom",
            title: T("tour.intro.missing.title"),
            content: T("tour.intro.missing.content"),
        }
    ]
}

function start_tour() {
    if (tour.ended()) tour.restart();
    else tour.start(true);
}

if (isSiteTour) {
    start_tour();
}
