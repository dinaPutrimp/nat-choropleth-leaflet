L.mapbox.accessToken = 'pk.eyJ1IjoiaWtrb2IiLCJhIjoiY2twMmY3b3prMWpvYjJvbXczdzk0OHF1ZSJ9.6j0RtV05VwqttLIR0RfWJg';
var map = L.mapbox.map('map')
    .setView([37.8, -96], 4)
    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));

// control position
// map.zoomControl.setPosition('bottomleft');



var getDataJson = async function () {
    const url = 'https://raw.githubusercontent.com/lulumalik/choropleth/master/public/us.json';
    const res = await fetch(url);
    const data = await res.json();
    // console.log(data);

    L.geoJson(data, {
        style: getStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

}

getDataJson();

function getStyle(feature) {
    return {
        weight: 2,
        opacity: 0.2,
        color: 'black',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.density)
    };
}

// dens for density
function getColor(dens) {
    return dens > 1000 ? '#005E36' :
        dens > 500 ? '#008256' :
            dens > 200 ? '#329E70' :
                dens > 100 ? '#52BA8A' :
                    dens > 50 ? '#70D8A6' :
                        dens > 20 ? '#77DFAD' :
                            dens > 10 ? '#8DF6C2' :
                                '#A5FFD9';
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: openDetail,
        mouseout: removeMark
    });
}


function openDetail(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        opacity: 0.3,
        //         fillOpacity: 0.9
    });


    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }


    openCard(layer.feature.properties);
    // info.update(layer.feature.properties);
}

function openCard(property) {
    const info = document.createElement('div');
    info.classList.add('info');
    info.innerHTML = '<h4>US Population Density</h4>' + (property ?
        '<b>' + property.name + '</b><br />' + property.density + ' people / mi<sup>2</sup>'
        : '');
    document.body.appendChild(info);
}


//remove mark style
function removeMark(e) {
    let lay = e.target;

    lay.setStyle({
        weight: 2,
        opacity: 0.2,
        color: 'black',
        fillOpacity: 0.7
    });

    removeCard();
}

function removeCard() {
    const info = document.querySelector('.info');
    info.remove();
}

//Layer Control
L.control.layers({
    'Streets': L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'),
    'Light': L.mapbox.styleLayer('mapbox://styles/mapbox/light-v10'),
    'Outdoors': L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v11')
}).addTo(map);




// search box
const searchInput = document.getElementById('search');
const serach_API = 'https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf6248689a30945e9841c285692e8387d3e58e&text=';
const direction_API = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248689a30945e9841c285692e8387d3e58e&start=8.681495,49.41461&end=8.687872,49.420318`;
const form = document.getElementById('form');
const startPlace = document.getElementById('start');
const destination = document.getElementById('destination');
const searcContainer = document.querySelector('.search-container');
let searchLinks = document.createElement('div');
searchLinks.classList.add('search-links');

//get data
async function getTextData(loc) {
    const res = await fetch(loc);
    const data = await res.json();

    showListLocation(data.features);
}


function showListLocation(links) {
    searchLinks.innerHTML = '';
    links.forEach((link) => {
        const linkEl = document.createElement('div');
        linkEl.classList.add('link');
        linkEl.innerHTML = `
                <p>${link.properties.name}, ${link.properties.country}</p>
                <small class="par">${link.properties.county}, ${link.properties.region}, ${link.properties.country}</small>
                <small class="hidden">${link.geometry.coordinates}</small>
        `;

        searchLinks.appendChild(linkEl);
    });

    searcContainer.appendChild(searchLinks);

    // Create Marker
    const linkTobe = document.querySelectorAll('.link');
    linkTobe.forEach(linkT => {
        linkT.addEventListener('click', (e) => {
            removeListLocation();
            let textPop = e.target.parentElement.children[1].innerText.split(",");
            let value = e.target.parentElement.children[2].innerText.split(",");
            let latLang = value.reverse();
            addMarker(latLang, textPop);
        });
    });

    function addMarker(coor, text) {
        var redMarker = {};
        map.setView(coor, 9);
        redMarker = L.marker(coor).bindPopup(`<h2 style="text-align: center">${text}`).openPopup().addTo(map);
    }

    function removeListLocation() {
        searchLinks.remove();
        searchInput.value = '';
    }
}


const hamburger = document.querySelector('.fa-bars');
const closeb = document.getElementById('close-btn');
const navSide = document.querySelector('nav');
const navInput = document.querySelector('.nav');
const zoomControl = document.querySelector('.leaflet-control-zoom');

searchInput.addEventListener('keydown', (e) => {
    const loc = e.target.value;

    if (loc !== '' && loc.length > 4) {
        getTextData(serach_API + loc);
        zoomControl.classList.add('move');
    }

    document.body.onclick = () => {
        if (loc) {
            searchLinks.remove();
            searchInput.value = '';
            zoomControl.classList.remove('move');
        }
    }
});


// Toggle nav
hamburger.addEventListener('click', () => {
    navSide.classList.add('active');
    searcContainer.classList.add('active');
    zoomControl.classList.add('active');
    navInput.style.opacity = '0';
});

closeb.addEventListener('click', () => {
    navSide.classList.remove('active');
    searcContainer.classList.remove('active');
    zoomControl.classList.remove('active');
    navInput.style.opacity = '1';
});
