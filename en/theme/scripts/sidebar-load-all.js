//language builds live under a subdirectory (/en/, /uk/, ...): the sidebar path must
//be resolved against the language prefix, not the raw first path segment.
//base_url comes from settings.js; not every page loads it, so fall back to the
//navbar brand link, which the subdirectory build rewrites to the prefixed root
let sidebar_prefix = "";
if (typeof base_url !== 'undefined') {
    sidebar_prefix = base_url.replace(/\/$/, "");
} else {
    let brand = document.querySelector(".navbar-brand");
    if (brand) sidebar_prefix = (brand.getAttribute("href") || "/").replace(/\/$/, "");
}
let sidebar_path = window.location.pathname;
if (sidebar_prefix && sidebar_path.indexOf(sidebar_prefix + "/") === 0) {
    sidebar_path = sidebar_path.slice(sidebar_prefix.length);
}
let mod_name = sidebar_path.split("/");
let mod_entry;
if (mod_name.includes('versions') && mod_name.length > 4){
    mod_entry = "/" + mod_name[3] + "/sidebar-" + mod_name[3]
}
else{
    mod_entry = "/" + mod_name[1] + "/sidebar-" + mod_name[1]
}
if (mod_name.includes('contact')){
    mod_entry = "/" + "resources/sidebar-resources"
}
$("#sidebars").load(sidebar_prefix + mod_entry, function() {
    let old_winlocation = window.location.href;
    if (mod_name.includes('versions')){
        let v_number = mod_name[2];
        old_winlocation = old_winlocation.replace('/versions/'+ v_number,'');
    }
    if (old_winlocation.includes('tour')){
        old_winlocation = old_winlocation.split('?')[0];
    }
    let navElements = document.querySelectorAll('.sidenav-head > a');
    let winlocation;
    navElements.forEach(function(element){
    if(!element.href.includes('changelog.html')){
        if(!old_winlocation.endsWith("/")){
            winlocation = old_winlocation + "/";
        }
        else{
            winlocation = old_winlocation
        }
        if(!element.href.endsWith("/")){
            element.href = element.href + "/";
        }
    }
    else{
        winlocation = old_winlocation
    }
    if(element.href == winlocation){
        $(element.parentNode).addClass("active");
    }});

    //This code is for creating a collapsable sidebar for the mobile view
    let mediaQuery = window.matchMedia('(max-width: 74.938rem)')
    function mobileSidenav(e) {
        if (e.matches) {
            $('#sidebar-collapse').collapse('hide')
        }
        else{
            $('#sidebar-collapse').collapse('show')
        }
    }
    $(document).ready(function() {
        mobileSidenav(mediaQuery)
        let sidenav = $(".sidenav-list");
        let sidenav_active_elements = $(".sidenav .active");
        if (sidenav_active_elements.length > 0) setTimeout(() => { //setTimeout gives bootstrap time to execute first
            let offsetValue = sidenav_active_elements[0].offsetTop;
            if (offsetValue <= 0){
                offsetValue = sidenav_active_elements[sidenav_active_elements.length - 1].offsetTop;
            }
            sidenav[0].scrollTop = offsetValue - 100;
        });
    });

    mediaQuery.addEventListener('change', mobileSidenav)
});