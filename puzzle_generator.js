var nodes = [1,2,3,4,5,6,7,8]
var edges = [[1,2], [1,3], [2,4],[2,5],[3,6],[3,7],[5,8]]
var switches = [1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 7]
var doorChanges = [];
for (var i = 0; i < Math.pow(2, edges.length); i++) {
    var binaryArray = Array.from(i.toString(2).padStart(edges.length, '0')).map(Number);
    // Optimization: make sure each lever opens 1 or 2 doors
    var numberOfOnes = binaryArray.reduce((count, bit) => count + bit, 0)
    if (numberOfOnes == 0 || numberOfOnes > 2) continue;
    doorChanges.push(binaryArray);
}
console.log('number of nodes: ', nodes.length)
console.log('number of edges: ', edges.length)
console.log('number of switches: ', switches.length)
console.log('possible changes: ', doorChanges.length)
var maxIndex = Math.pow(doorChanges.length, switches.length);
console.log('number of puzzles: ', maxIndex)

function getAvailableSwitches(location) {
    var availableSwitches = [];
    for (var i = 0; i < switches.length; i++) {
        if (switches[i] == location) {
            availableSwitches.push(i);
        }
    }
    return availableSwitches;
}

function getAccessibleNodes(location, currentEdges, accessibleNodes) { 
    if (accessibleNodes.indexOf(location) == -1) {
        accessibleNodes.push(location);
    }

    for (var i = 0; i < currentEdges.length; i++) {
        var edge = currentEdges[i];
        var index = edge.indexOf(location);
        if (index != -1) {
            var accessibleLocation = edge[1 - index];
            if (accessibleNodes.indexOf(accessibleLocation) == -1) {
                accessibleNodes.push(accessibleLocation);
                getAccessibleNodes(accessibleLocation, currentEdges, accessibleNodes);
            } 
        }
    }
}

function hasEdge(edgesArray, edge) {
    for (var i = 0; i < edgesArray.length; i++) {
        if (edgesArray[i][0] == edge[0] && edgesArray[i][1] == edge[1]) {
            return i
        }
    }
    return -1;
}

function flipSwitch(currentSwitch, currentEdges) {
    var change = doorChanges[currentSwitch]
    var newEdges = structuredClone(currentEdges);
    for (var k = 0; k < change.length; k++) {
        if (change[k]) {
            var edgeToToggle = edges[k];
            var edgeIndex = hasEdge(newEdges, edgeToToggle)
            if (edgeIndex == -1) {
                newEdges.push(edgeToToggle);
            } else {
                newEdges.splice(edgeIndex, 1)
            }

        }
    }
    return newEdges;
}

function sortEdges(a, b) {
    if (a[0] < b[0]) {
        return -1;
    } else if (a[0] > b[0]) {
        return 1;
    } else if (a[1] < b[1]) {
        return -1
    } else if (a[1] > b[1]) {
        return 1
    }
    return 0;
}

var successes = {};

function testScenario(currentLocation, currentEdges, visited, path, index, attempts) {

    // if you are in the same room, skip and try next attempt
    if (path.length >= 2 && path[path.length - 2] == path[path.length - 1]) {
        if (attempts.length > 0) {
            var attempt = attempts.shift();
            testScenario(attempt[0], attempt[1], attempt[2], attempt[3], attempt[4], attempts);
        }
        return;
    }
    currentEdges.sort(sortEdges);
    // if you're in the same situation as something previous, skip and try next attempt
    if (visited[currentLocation.toString() + '_' + currentEdges.toString()]) {
        if (attempts.length > 0) {
            var attempt = attempts.shift();
            testScenario(attempt[0], attempt[1], attempt[2], attempt[3], attempt[4], attempts);
        }
        return;
    }
    visited[currentLocation.toString() + '_' + currentEdges.toString()] = true;

    var allLocations = [];
    getAccessibleNodes(currentLocation, currentEdges, allLocations);
    for (var j = 0; j < allLocations.length; j++) {
        var location = allLocations[j];

        // check if the final location is accessible, if so add to success object
        if (location == nodes[nodes.length - 1]) {
            if (!successes[index] || successes[index].length > path.length) {
                successes[index] = path
            }
            return;
        }

        // get all possible switches
        var availableSwitches = getAvailableSwitches(location);
        // try every permutation of available switches
        for (var i = 0; i < availableSwitches.length; i++) {
            var newEdges = flipSwitch(switchIndexes[availableSwitches[i]], currentEdges)
            var newPath = structuredClone(path);
            newPath.push(availableSwitches[i])
            attempts.push([location, newEdges, visited, newPath, index])
        }
    }
    // try next attempt
    if (attempts.length > 0) {
        var attempt = attempts.shift();
        testScenario(attempt[0], attempt[1], attempt[2], attempt[3], attempt[4], attempts);
    }
}

function printLongest() {
    var longest = []
    var index = null;
    for (var key in successes) {
        if (successes[key].length > longest.length) {
            longest = successes[key];
            index = key
        }
    }
    if (longest.length == 0) return;

    console.log('successIndex:', index, 'successPath:',longest);
    var switchIndexes = [];
    var remaining = index;
    for (var j = 0; j < switches.length; j++){
        switchIndexes[switches.length - 1 - j] = remaining % doorChanges.length
        remaining = Math.floor(remaining / doorChanges.length)
    }
    for (var j = 0; j < switchIndexes.length; j++) {
        console.log(doorChanges[switchIndexes[j]]);
    }
}

function isDuplicateSwitch() {
    var set = {}
    for (var key of switchIndexes) {
        if (set[key]) {
            return true;
        }
        set[key] = true
    }
    return false;
}

var startTime = Date.now();
var numTrials = 1e8;
for (var i = 1; i < numTrials; i += 1){
    var switchIndexes = [];
    var index = Math.floor(maxIndex * Math.random())
    var remaining = index
    for (var j = 0; j < switches.length; j++){
		switchIndexes[switches.length - 1 - j] = remaining % doorChanges.length
		remaining = Math.floor(remaining / doorChanges.length)
    }
    if (i % 1000000 == 0) {
        var elapsedTime = (Date.now() - startTime) / 1000;
        var totalTime = elapsedTime / (i / numTrials);
        console.log('index:', i,
            '\npercentComplete:', i / numTrials * 100,
            '\nhoursOfWork:', totalTime / 60 / 60)
        printLongest();
    }
    if (isDuplicateSwitch(switchIndexes)) continue;
    var currentEdges = [];
    var currentLocation = nodes[0]
    testScenario(currentLocation, currentEdges, {}, [], index, []);
}