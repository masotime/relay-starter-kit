// why are there still no comprehensions in Javascript
const makeRange = (start, end, step = 1) => {
	let i, result = [];
	for (i = start; i < end; i += step) {
		result.push(i);
	}
	return result;
};

const pojo = (theClass, props) => Object.keys(props).reduce( (obj, key) => {
		obj[key] = props[key];
		return obj;
	}, new theClass());


// "types"
class Game extends Object {}
class HidingSpot extends Object {}

// "mocks"
const game = new Game();
game.id = '1';

const hidingSpots = (function generateHidingSpots() {
	const indexOfSpotWithTreasure = Math.floor(Math.random() * 9);

	return makeRange(0,9).map( i => pojo(HidingSpot, {
			id: `${i}`,
			hasTreasure: i === indexOfSpotWithTreasure,
			hasBeenChecked: false
		})
	);
}());

// "state"
let turnsRemaining = 3;

// "exports"
export function checkHidingSpotForTreasure(id) {
	if (hidingSpots.some(hs => hs.hasTreasure && hs.hasBeenChecked)) {
		return; // ???
	}

	turnsRemaining-=1;
	getHidingSpot(id).hasBeenChecked = true;
}

export const getHidingSpot = id => hidingSpots.find(hs => hs.id === id);
export const getGame = () => game;
export const getHidingSpots = () => hidingSpots;
export const getTurnsRemaining = () => turnsRemaining;