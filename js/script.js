// Global variables
var loc, longitude, latitude, center, json_obj, directionsManager, directionsManager2, map, infobox, distance2, distanceUnits2, dirMan1, dirMan2, dirMan3, order1, order2, directions;
var locationDistances = []

// Function to get Map onto the webpage
function GetMap() {
    map = new Microsoft.Maps.Map(document.getElementById('map'), {
        credentials: BING_API_KEY
    });

    //Request the user's location
    navigator.geolocation.getCurrentPosition(function (position) {
        loc = new Microsoft.Maps.Location(
            position.coords.latitude,
            position.coords.longitude);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        //Add a pushpin at the user's location.
        var pin = new Microsoft.Maps.Pushpin(loc, {
            color: 'blue'
        });
        map.entities.push(pin);

        //Center the map on the user's location.
        map.setView({ center: loc, zoom: 15 });
    });
}

//Function to get the restaurants near user location
function getRestaurantsNearMe() {

    //remove disable class after finding restaurants
    document.getElementById("getNearFarRestBtn").disabled = false;
    document.getElementById("getNearFarRestBtnWalk").disabled = false;
    $('.nav-tabs li a[href="#task1"]').removeClass('disabled');
    $('.nav-tabs li a[href="#task2"]').removeClass('disabled');

    // Zomato api get call for /search returns restaurants of count 10
    let url = "https://developers.zomato.com/api/v2.1/search?apikey=" + ZOMATO_API_KEY + "&count=10&lat=" + loc.latitude + "&lon=" + loc.longitude + "&sort=real_distance&order=asc";
    json_obj = JSON.parse(Get(url));
    var count = 1;
    json_obj.restaurants.forEach((restaurant, index) => {
        var center1 = new Microsoft.Maps.Location(restaurant.restaurant.location.latitude, restaurant.restaurant.location.longitude);
        infobox = new Microsoft.Maps.Infobox(center1, {
            visible: false
        });

        //Assign the infobox to a map instance.
        infobox.setMap(map);
        pin = new Microsoft.Maps.Pushpin(center1, {
            title: restaurant.restaurant.name,

            text: count.toString()
        });
        pin.metadata = {
            title: restaurant.restaurant.name,
            description: restaurant.restaurant.location.address
        };

        Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);

        //Add the pushpin to the map
        map.entities.push(pin);
        count++;
    });
    map.setView({ center: loc, zoom: 15 });
    getDrivingDistances();
}

function getDrivingDistances() {
    var distances = [];
    var distancesArr = [];
    for (let json in json_obj.restaurants) {
        // url simple distance matrix between a set of origins and destinations
        let url = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=" + loc.latitude + "," + loc.longitude + "&destinations=" + json_obj.restaurants[json].restaurant.location.latitude + "," + json_obj.restaurants[json].restaurant.location.longitude + "&travelMode=driving&key=" + BING_API_KEY;
        locationDistances = JSON.parse(Get(url));
        distances.push(locationDistances.resourceSets[0].resources[0].results[0].travelDistance);
        distancesArr.push({ 'key': json, 'val': locationDistances.resourceSets[0].resources[0].results[0].travelDistance })
    }
    distance = distances.sort();
    console.log(distancesArr);
    // to find the nearest and farthest restaurants from the 10 restaurants
    for (let i in distances) {
        console.log(distancesArr[i].val);
        if (distances[0] == distancesArr[i].val) {
            order1 = distancesArr[i].key;
        }
        if (distances[9] == distancesArr[i].val) {
            order2 = distancesArr[i].key;
        }
    }
}

function pushpinClicked(e) {
    //Make sure the infobox has metadata to display.
    if (e.target.metadata) {
        //Set the infobox options with the metadata of the pushpin.
        infobox.setOptions({
            location: e.target.getLocation(),
            title: e.target.metadata.title,
            description: e.target.metadata.description,
            visible: true
        });
    }
}

// function to call nearest and farthest restaurants on functions , travel mode Driving
function getNearAndFarRest() {
    var z = document.getElementById("sub-heading");
    if (z.style.display === "none") {
        z.style.display = "block";
    }
    shortDistanceMap();
    farDistanceMap();
}

// function to call nearest and farthest restaurants on functions , travel mode walking
function getNearAndFarRestWalk() {
    var z = document.getElementById("sub-heading");
    if (z.style.display === "none") {
        z.style.display = "block";
    }

    shortDistanceMapWalk();
    farDistanceMapWalk();
}
// function to show nearest restaurant on Map , travel mode Walk
function shortDistanceMapWalk() {
    var map2 = new Microsoft.Maps.Map(document.getElementById('map2'), {});
    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        //Create an instance of the directions manager.
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map2);

        directionsManager.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.walking
        });

        //Create waypoints to route between.
        var seattleWaypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: 'Home', location: loc });
        directionsManager.addWaypoint(seattleWaypoint1);

        var workWaypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: json_obj.restaurants[order1].restaurant.name, location: new Microsoft.Maps.Location(json_obj.restaurants[order1].restaurant.location.latitude, json_obj.restaurants[order1].restaurant.location.longitude) });
        directionsManager.addWaypoint(workWaypoint1);

        //Add event handlers to directions manager.
        Microsoft.Maps.Events.addHandler(directionsManager, 'directionsError', directionsError);
        Microsoft.Maps.Events.addHandler(directionsManager, 'directionsUpdated', directionsUpdated);

        //Calculate directions.
        directionsManager.calculateDirections();
    });
}

// function to show farthest restaurant on Map , travel mode Walk
function farDistanceMapWalk() {
    map3 = new Microsoft.Maps.Map(document.getElementById('map3'), {});
    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        //Create an instance of the directions manager.
        directionsManager2 = new Microsoft.Maps.Directions.DirectionsManager(map3);
        directionsManager2.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.walking
        });

        //Create waypoints to route between.
        var seattleWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: 'Home', location: loc });
        directionsManager2.addWaypoint(seattleWaypoint);

        var workWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: json_obj.restaurants[order2].restaurant.name, location: new Microsoft.Maps.Location(json_obj.restaurants[order2].restaurant.location.latitude, json_obj.restaurants[order2].restaurant.location.longitude) });
        directionsManager2.addWaypoint(workWaypoint);

        //Add event handlers to directions manager.
        Microsoft.Maps.Events.addHandler(directionsManager2, 'directionsError', directionsError2);
        Microsoft.Maps.Events.addHandler(directionsManager2, 'directionsUpdated', directionsUpdated2);
        //Calculate directions.
        directionsManager2.calculateDirections();
    });
}

// function to show nearest restaurant on Map , travel mode drive
function shortDistanceMap() {
    var map2 = new Microsoft.Maps.Map(document.getElementById('map2'), {});
    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        //Create an instance of the directions manager.
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map2);
        directionsManager.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.driving
        });

        //Create waypoints to route between.
        var seattleWaypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: 'Home', location: loc });
        directionsManager.addWaypoint(seattleWaypoint1);

        var workWaypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: json_obj.restaurants[order1].restaurant.name, location: new Microsoft.Maps.Location(json_obj.restaurants[order1].restaurant.location.latitude, json_obj.restaurants[order1].restaurant.location.longitude) });
        directionsManager.addWaypoint(workWaypoint1);

        //Add event handlers to directions manager.
        Microsoft.Maps.Events.addHandler(directionsManager, 'directionsError', directionsError);
        Microsoft.Maps.Events.addHandler(directionsManager, 'directionsUpdated', directionsUpdated);
        //Calculate directions.
        directionsManager.calculateDirections();
    });
}

// function to show farthest restaurant on Map , travel mode driving
function farDistanceMap() {
    map3 = new Microsoft.Maps.Map(document.getElementById('map3'), {});
    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        //Create an instance of the directions manager.
        directionsManager2 = new Microsoft.Maps.Directions.DirectionsManager(map3);

        directionsManager2.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.driving
        });

        //Create waypoints to route between.
        var seattleWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: 'Home', location: loc });
        directionsManager2.addWaypoint(seattleWaypoint);

        var workWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: json_obj.restaurants[order2].restaurant.name, location: new Microsoft.Maps.Location(json_obj.restaurants[order2].restaurant.location.latitude, json_obj.restaurants[order2].restaurant.location.longitude) });
        directionsManager2.addWaypoint(workWaypoint);

        //Add event handlers to directions manager.
        Microsoft.Maps.Events.addHandler(directionsManager2, 'directionsError', directionsError2);
        Microsoft.Maps.Events.addHandler(directionsManager2, 'directionsUpdated', directionsUpdated2);
        //Calculate directions.
        directionsManager2.calculateDirections();
    });
}

//event to update directions on map
function directionsUpdated(e) {
    //Get the current route index.
    var routeIdx = directionsManager.getRequestOptions().routeIndex;

    //Get the distance of the route, rounded to 2 decimal places.
    var distance = Math.round(e.routeSummary[routeIdx].distance * 100) / 100;

    //Get the distance units used to calculate the route.
    var units = directionsManager.getRequestOptions().distanceUnit;
    var distanceUnits = '';

    if (units == Microsoft.Maps.Directions.DistanceUnit.km) {
        distanceUnits = 'km'
    } else {
        //Must be in miles
        distanceUnits = 'miles'
    }

    //innerHTML to show the distance
    document.getElementById('routeInfoPanel').innerHTML = 'Distance: ' + distance + ' ' + distanceUnits;
}

//to display route error in directions 
function directionsError(e) {
    alert('Error: ' + e.message + '\r\nResponse Code: ' + e.responseCode)
}

//event to update directions on map
function directionsUpdated2(e) {
    //Get the current route index.
    var routeIdx = directionsManager2.getRequestOptions().routeIndex;

    //Get the distance of the route, rounded to 2 decimal places.
    var distance2 = Math.round(e.routeSummary[routeIdx].distance * 100) / 100;

    //Get the distance units used to calculate the route.
    var units = directionsManager2.getRequestOptions().distanceUnit;
    distanceUnits2 = '';

    if (units == Microsoft.Maps.Directions.DistanceUnit.km) {
        distanceUnits2 = 'km'
    } else {
        //Must be in miles
        distanceUnits2 = 'miles'
    }

    //innerHTML to show the distance
    document.getElementById('routeInfoPanel2').innerHTML = 'Distance: ' + distance2 + ' ' + distanceUnits2;
}

//to display route error in directions 
function directionsError2(e) {
    alert('Error: ' + e.message + '\r\nResponse Code: ' + e.responseCode)
}

//Function to handle task 1
function task1() {

    //coordinates of user location
    var trimap = new Microsoft.Maps.Map('#trimap', {});
    //coordinates of user location
    var center = new Microsoft.Maps.Location(latitude, longitude);
    //coordinates of Near Restaurant
    var point1 = new Microsoft.Maps.Location(json_obj.restaurants[order1].restaurant.location.latitude, json_obj.restaurants[order1].restaurant.location.longitude);
    //coordinates of Farthest restaurant
    var point2 = new Microsoft.Maps.Location(json_obj.restaurants[order2].restaurant.location.latitude, json_obj.restaurants[order2].restaurant.location.longitude);

    //Create array of locations to form a ring.
    var exteriorRing = [
        center,
        point1,
        point2,
        center
    ];

    //Create a polygon
    var polygon = new Microsoft.Maps.Polygon(exteriorRing, {
        fillColor: 'rgba(0, 255, 0, 0.5)',
        strokeColor: 'red',
        strokeThickness: 2
    });

    //Info popup
    infobox.setMap(trimap);
    pin1 = new Microsoft.Maps.Pushpin(center, {
        title: "A(" + latitude + "," + longitude + ")",
    });
    pin1.metadata = {
        title: "Home",
        description: "Your Location"
    };

    pin2 = new Microsoft.Maps.Pushpin(point1, {
        title: "B(" + json_obj.restaurants[order1].restaurant.location.latitude + "," + json_obj.restaurants[order1].restaurant.location.longitude + ")",
    });
    pin2.metadata = {
        title: json_obj.restaurants[order1].restaurant.name,
        description: json_obj.restaurants[order1].restaurant.location.address
    };

    pin3 = new Microsoft.Maps.Pushpin(point2, {
        title: "C(" + json_obj.restaurants[order2].restaurant.location.latitude + "," + json_obj.restaurants[order2].restaurant.location.longitude + ")"

    });
    pin3.metadata = {
        title: json_obj.restaurants[order2].restaurant.name,
        description: json_obj.restaurants[order2].restaurant.location.address
    };

    // event to display info box
    Microsoft.Maps.Events.addHandler(pin1, 'click', pushpinClicked);
    Microsoft.Maps.Events.addHandler(pin2, 'click', pushpinClicked);
    Microsoft.Maps.Events.addHandler(pin3, 'click', pushpinClicked);

    //Add the pushpin to the map
    trimap.entities.push(pin1);
    trimap.entities.push(pin2);
    trimap.entities.push(pin3);

    //Add the polygon to map
    trimap.entities.push(polygon);
    trimap.setView({ center: center, zoom: 14 });

    //loac spatial Math Module
    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', function () {

        // get Distance between coordinates
        var AtoB = Microsoft.Maps.SpatialMath.getDistanceTo(new Microsoft.Maps.Location(loc.latitude, loc.longitude),
            new Microsoft.Maps.Location(json_obj.restaurants[order1].restaurant.location.latitude, json_obj.restaurants[order1].restaurant.location.longitude), Microsoft.Maps.SpatialMath.DistanceUnits.Kilometers)

        var BtoC = Microsoft.Maps.SpatialMath.getDistanceTo(new Microsoft.Maps.Location(json_obj.restaurants[order1].restaurant.location.latitude, json_obj.restaurants[order1].restaurant.location.longitude),
            new Microsoft.Maps.Location(json_obj.restaurants[order2].restaurant.location.latitude, json_obj.restaurants[order2].restaurant.location.longitude), Microsoft.Maps.SpatialMath.DistanceUnits.Kilometers)

        var AtoC = Microsoft.Maps.SpatialMath.getDistanceTo(new Microsoft.Maps.Location(loc.latitude, loc.longitude),
            new Microsoft.Maps.Location(json_obj.restaurants[order2].restaurant.location.latitude, json_obj.restaurants[order2].restaurant.location.longitude), Microsoft.Maps.SpatialMath.DistanceUnits.Kilometers)

        document.getElementById('AtoB').innerHTML = AtoB;
        document.getElementById('BtoC').innerHTML = BtoC;
        document.getElementById('AtoC').innerHTML = AtoC;
        var distance = addSides(AtoB, BtoC, AtoC);

        //area of the triangle
        var area = calcAreaofTriangle(AtoB, BtoC, AtoC);
        document.getElementById('perimeter').innerHTML = (distance / 2).toFixed(2);
        document.getElementById('area').innerHTML = area;

        //calculate time taken
        var time = calculateTime(distance) * 60;
        var hours = Math.trunc(time / 60);
        var minutes = time % 60;

        document.getElementById('distance1').innerHTML = distance.toFixed(2);
        document.getElementById('timeinmins').innerHTML = hours + "<span> Hr</span> :" + ~~minutes + " <span> Mins</span>";
    });
}

//Function to handle task 1
function task2() {
    var map2 = new Microsoft.Maps.Map(document.getElementById('drivingmap1'), {});

    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        //Create an instance of the directions manager.
        dirMan1 = new Microsoft.Maps.Directions.DirectionsManager(map2);
        dirMan1.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.driving
        });

        //Create waypoints to route between.
        var seattleWaypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: "Home", location: loc });
        dirMan1.addWaypoint(seattleWaypoint1);

        var workWaypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: json_obj.restaurants[order1].restaurant.name, location: new Microsoft.Maps.Location(json_obj.restaurants[order1].restaurant.location.latitude, json_obj.restaurants[order1].restaurant.location.longitude) });
        dirMan1.addWaypoint(workWaypoint1);

        //Add event handlers to directions manager.
        Microsoft.Maps.Events.addHandler(dirMan1, 'directionsError', directionsError3);
        Microsoft.Maps.Events.addHandler(dirMan1, 'directionsUpdated', directionsUpdated3);
        //Calculate directions.
        dirMan1.calculateDirections();
    });
    var map3 = new Microsoft.Maps.Map(document.getElementById('drivingmap2'), {});
    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        //Create an instance of the directions manager.
        dirMan2 = new Microsoft.Maps.Directions.DirectionsManager(map3);
        dirMan2.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.driving
        });

        //Create waypoints to route between.
        var seattleWaypoint2 = new Microsoft.Maps.Directions.Waypoint({ address: "Home", location: loc });
        dirMan2.addWaypoint(seattleWaypoint2);

        var workWaypoint2 = new Microsoft.Maps.Directions.Waypoint({ address: json_obj.restaurants[order2].restaurant.name, location: new Microsoft.Maps.Location(json_obj.restaurants[order2].restaurant.location.latitude, json_obj.restaurants[order2].restaurant.location.longitude) });
        dirMan2.addWaypoint(workWaypoint2);

        //Add event handlers to directions manager.
        Microsoft.Maps.Events.addHandler(dirMan2, 'directionsError', directionsError4);
        Microsoft.Maps.Events.addHandler(dirMan2, 'directionsUpdated', directionsUpdated4);
        //Calculate directions.
        dirMan2.calculateDirections();
    });
    var map4 = new Microsoft.Maps.Map(document.getElementById('drivingmap3'), {});

    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        //Create an instance of the directions manager.
        dirMan3 = new Microsoft.Maps.Directions.DirectionsManager(map4);

        dirMan3.setRequestOptions({
            routeMode: Microsoft.Maps.Directions.RouteMode.driving
        });

        //Create waypoints to route between.
        var seattleWaypoint3 = new Microsoft.Maps.Directions.Waypoint({ address: json_obj.restaurants[order1].restaurant.name, location: new Microsoft.Maps.Location(json_obj.restaurants[order1].restaurant.location.latitude, json_obj.restaurants[order1].restaurant.location.longitude) });
        dirMan3.addWaypoint(seattleWaypoint3);

        var workWaypoint3 = new Microsoft.Maps.Directions.Waypoint({ address: json_obj.restaurants[order2].restaurant.name, location: new Microsoft.Maps.Location(json_obj.restaurants[order2].restaurant.location.latitude, json_obj.restaurants[order2].restaurant.location.longitude) });
        dirMan3.addWaypoint(workWaypoint3);

        //Add event handlers to directions manager.
        Microsoft.Maps.Events.addHandler(dirMan3, 'directionsError', directionsError5);
        Microsoft.Maps.Events.addHandler(dirMan3, 'directionsUpdated', directionsUpdated5);
        //Calculate directions.
        dirMan3.calculateDirections();
    });

    //set view in map
    map2.setView({ center: loc, zoom: 14 });
    map3.setView({ center: loc, zoom: 14 });
    map4.setView({ center: new Microsoft.Maps.Location(json_obj.restaurants[order2].restaurant.location.latitude, json_obj.restaurants[order2].restaurant.location.longitude), zoom: 14 });

    //Distance Matrix to get the distance between user location and nearest restaurant location
    let url1 = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=" + loc.latitude + "," + loc.longitude + "&destinations=" + json_obj.restaurants[order1].restaurant.location.latitude + "," + json_obj.restaurants[order1].restaurant.location.longitude + "&travelMode=driving&key=" + BING_API_KEY;
    //Distance Matrix to get the distance between nearest restaurant location and farthest location
    let url2 = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=" + json_obj.restaurants[order1].restaurant.location.latitude + "," + json_obj.restaurants[order1].restaurant.location.longitude + "&destinations=" + json_obj.restaurants[order2].restaurant.location.latitude + "," + json_obj.restaurants[order2].restaurant.location.longitude + "&travelMode=driving&key=" + BING_API_KEY;
    //Distance Matrix to get the distance between user location and farthest restaurant location
    let url3 = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=" + loc.latitude + "," + loc.longitude + "&destinations=" + json_obj.restaurants[order2].restaurant.location.latitude + "," + json_obj.restaurants[order2].restaurant.location.longitude + "&travelMode=driving&key=" + BING_API_KEY;

    //parse response into json
    var getDistances1 = JSON.parse(Get(url1));
    var getDistances2 = JSON.parse(Get(url2));
    var getDistances3 = JSON.parse(Get(url3));

    //get the distance between the points
    var AtoB = getDistances1.resourceSets[0].resources[0].results[0].travelDistance;
    var BtoC = getDistances2.resourceSets[0].resources[0].results[0].travelDistance;
    var AtoC = getDistances3.resourceSets[0].resources[0].results[0].travelDistance;

    //distance covered
    var distance = addSides(AtoB, BtoC, AtoC);

    //area
    var area = calcAreaofTriangle(AtoB, BtoC, AtoC);
    document.getElementById('perimeter2').innerHTML = (distance / 2).toFixed(2);
    document.getElementById('area2').innerHTML = area;

    var time = calculateTime(distance) * 60;
    var hours = Math.trunc(time / 60);
    var minutes = time % 60;

    document.getElementById('distance2').innerHTML = distance.toFixed(2);
    document.getElementById('timeinmins2').innerHTML = hours + "<span> Hr</span> :" + ~~minutes + " <span> Mins</span>";
}

//event to update directions on map
function directionsUpdated3(e) {
    //Get the current route index.
    var routeIdx = dirMan1.getRequestOptions().routeIndex;

    //Get the distance of the route, rounded to 2 decimal places.
    var distance2 = Math.round(e.routeSummary[routeIdx].distance * 100) / 100;

    //Get the distance units used to calculate the route.
    var units = dirMan1.getRequestOptions().distanceUnit;
    distanceUnits2 = '';

    if (units == Microsoft.Maps.Directions.DistanceUnit.km) {
        distanceUnits2 = 'km'
    } else {
        //Must be in miles
        distanceUnits2 = 'miles'
    }

    //Time is in seconds, convert to minutes and round off.
    var time2 = Math.round(e.routeSummary[routeIdx].timeWithTraffic / 60);
    document.getElementById('routeInfo1').innerHTML = distance2;

}

function directionsError3(e) {
    alert('Error: ' + e.message + '\r\nResponse Code: ' + e.responseCode)
}

//event to update directions on map
function directionsUpdated4(e) {
    //Get the current route index.
    var routeIdx = dirMan2.getRequestOptions().routeIndex;

    //Get the distance of the route, rounded to 2 decimal places.
    var distance2 = Math.round(e.routeSummary[routeIdx].distance * 100) / 100;

    //Get the distance units used to calculate the route.
    var units = dirMan2.getRequestOptions().distanceUnit;
    distanceUnits2 = '';

    if (units == Microsoft.Maps.Directions.DistanceUnit.km) {
        distanceUnits2 = 'km'
    } else {
        //Must be in miles
        distanceUnits2 = 'miles'
    }

    //Time is in seconds, convert to minutes and round off.
    var time2 = Math.round(e.routeSummary[routeIdx].timeWithTraffic / 60);
    document.getElementById('routeInfo2').innerHTML = distance2;
}

function directionsError4(e) {
    alert('Error: ' + e.message + '\r\nResponse Code: ' + e.responseCode)
}

//event to update directions on map
function directionsUpdated5(e) {
    //Get the current route index.
    var routeIdx = dirMan3.getRequestOptions().routeIndex;

    //Get the distance of the route, rounded to 2 decimal places.
    var distance2 = Math.round(e.routeSummary[routeIdx].distance * 100) / 100;

    //Get the distance units used to calculate the route.
    var units = dirMan3.getRequestOptions().distanceUnit;
    distanceUnits2 = '';

    if (units == Microsoft.Maps.Directions.DistanceUnit.km) {
        distanceUnits2 = 'km'
    } else {
        //Must be in miles
        distanceUnits2 = 'miles'
    }

    //Time is in seconds, convert to minutes and round off.
    var time2 = Math.round(e.routeSummary[routeIdx].timeWithTraffic / 60);
    document.getElementById('routeInfo3').innerHTML = distance2;
}

function directionsError5(e) {
    alert('Error: ' + e.message + '\r\nResponse Code: ' + e.responseCode)
}

//calculate area using Heron's formula 
function calcAreaofTriangle(A, B, C) {
    var s = (A + B + C) / 2;
    var area = Math.sqrt(s * ((s - A) * (s - B) * (s - C)));
    return area.toFixed(2);
}

//calculate time taken
function calculateTime(d) {
    var t = d / 5;
    return t;
}

//add the sides of polygon
function addSides(A, B, C) {
    var s = (A + B + C);
    return s;
}

//function to perfom http Get Request and return response. 
function Get(yourUrl) {
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", yourUrl, false);
    Httpreq.send(null);
    return Httpreq.responseText;
}


