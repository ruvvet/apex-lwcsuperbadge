// 5. create boatTile
// for each tile, we passed down a boat from the parent as a prop
//then we get the boat data for the boat using @wire

import { LightningElement, api } from 'lwc';

const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper'

export default class BoatTile extends LightningElement {
  // get boat data
  @api
  boat;

  // get selectedBoatId
  @api
  selectedBoatId;

  // Getter for dynamically setting the background image for the picture
  // get the background image which is called in the div style={bgstyle}
  get backgroundStyle() {
    return `background-image:url(${this.boat.Picture__c})`
  }

  // Getter for dynamically setting the tile class based on whether the
  // current boat is selected
  // change the style of the tile
  // if true, no style, if this boat is not the selectedBoat then set the style on whether the tile is selected or not
  get tileClass() {
    return this.boat.Id === this.selectedBoatId || this.selectedBoatId ? TILE_WRAPPER_SELECTED_CLASS : TILE_WRAPPER_UNSELECTED_CLASS
  }

  // Fires event with the Id of the boat that has been selected.
  // custom event called boatSelect is dispatched with the id of the boat and the id of the selectedboat
  // in boatsearchresults + similarboats, onboatselect is used to select a new boat to display details/selected boat details
  selectBoat() {
    const selectedEvent = new CustomEvent('boatselect', {
      detail: {boatId: this.boat.Id, selectedBoatId: this.selectedBoatId}
    });
    this.dispatchEvent(selectedEvent);
  }
}