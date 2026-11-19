//is the user doing a tour of the entire site, or just this module?
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
