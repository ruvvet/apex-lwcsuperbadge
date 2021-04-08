import { LightningElement, wire, track } from "lwc";
// import getBoatTypes Apex method from BoatDataService class
import getBoatTypes from "@salesforce/apex/BoatDataService.getBoatTypes";

export default class BoatSearchForm extends LightningElement {
  // @track decorator detects if the value changes, and re-renders - used with fields
  // track the fields: selectedBoatTypeId + searchoptions which is rendered in the combobox
  @track selectedBoatTypeId = "";
  @track error = undefined;
  @track searchOptions; // why no this. here?

  // @wire decorator reads data calls the apex controller method to get data
  // call the getBoatTypes Apex method
  //@wire(adapterId, adapterConfig)
  @wire(getBoatTypes)
  // decorate the function boatTypes with wire so it is called again each time the data changes
  // wire service provisions the function an object with error and data properties
  // so boatTypes function is re-called each time data changes
  boatTypes({ error, data }) {
    // if data (no error)
    if (data) {
      // map over the data to get the {label, value} and assign to searchOptions
      // to get all the types of boats available
      this.searchOptions = data.map((type) => {
        return {
          label: type.Name,
          value: type.Id
        };
      });
      // for whatever reason we did not spread the array and instead just insert this back into searchOptions
      this.searchOptions.unshift({ label: "All Types", value: "" });
    } else if (error) {
      // if theres no data/an error
      // assign undefined to searchOptions
      // assign returned error to error
      this.searchOptions = undefined;
      this.error = error;
    }
  }

  // onChange event for search combobox
  handleSearchOptionChange(event) {
    // prevent default selection interaction
    event.preventDefault();
    // assign input value to the value from the selected dropdown
    this.selectedBoatTypeId = event.detail.value;
    // create a new customEvent called searchEvent with search tag
    // dispatches the search custom event with the detail payload (selected boat Id)
    // in the boatSearch parent component, an event handler called onSearch will execute another function
    const searchEvent = new CustomEvent("search", {
      detail: {
        boatTypeId: this.selectedBoatTypeId
      }
    });
    this.dispatchEvent(searchEvent);
  }
}
