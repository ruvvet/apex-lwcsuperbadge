// 8. boatSearchResults
import { LightningElement, wire, api, track } from "lwc";
// import getBoats Apex method
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
// import lightning methods
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
// import publish, messageContext from messageService socket methods
// import the customMessageChannel
// These two components publish a message and subscribe to the message over the same message channel.
import { publish, MessageContext } from "lightning/messageService";
// why is this boatMC?
import BoatMC from "@salesforce/messageChannel/BoatMessageChannel__c";
//import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";

const SUCCESS_TITLE = "Success";
const MESSAGE_SHIP_IT = "Ship it!";
const SUCCESS_VARIANT = "success";
const ERROR_TITLE = "Error";
const MESSAGE_CONTACT_ADMIN = "Contact System Admin!";
const ERROR_VARIANT = "error";

export default class boatSearchResults extends LightningElement {
  // init some variables
  selectedBoatId;
  columns = [
    { label: "Name", fieldName: "Name", type: "text", editable: "true" },
    {
      label: "Length",
      fieldName: "Length__c",
      type: "number",
      editable: "true"
    },
    {
      label: "Price",
      fieldName: "Price__c",
      type: "currency",
      editable: "true"
    },
    {
      label: "Description",
      fieldName: "Description__c",
      type: "text",
      editable: "true"
    }
  ];
  boatTypeId = "";
  isLoading = false;
  error = undefined;
  wiredBoatsResult;
  //track boats + draftValues
  @track
  boats;
  @track
  draftValues = [];
  // wired message context
  // this returns a messageContext object from the message service that the component is subscribed to
  // When using the @wire(MessageContext) adapter, you don’t have to interact with any of the component’s lifecycle events.
  // The Lightning message service features automatically unregister when the component is destroyed.
  @wire(MessageContext)
  messageContext;

  // call the searchBoats function in the parent container + pass the boatTypeId as a param
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  // this function must update selectedBoatId and call sendMessageService
  // onboatSelect (customEvent in boatTile)
  // update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // decorate the function getBoats with wire so it is called again each time the data changes
  //@wire(adapterId, adapterConfig)
  @wire(getBoats, { boatTypeId: "$boatTypeId" }) // why $boatTypeId?
  // wired getBoats method
  // i guess we don't use { error, data } because we only are checking to see if we got data back or not
  wiredBoats(result) {
    this.boats = result;
    if (result.error) {
      // if there was an error returned w/ results, then update the error/boat var
      this.error = result.error;
      this.boats = undefined;
    }
    // otherwise we got results, set loading to false and call the notifyLoading function with false
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // Publishes the selected boat Id on the BoatMC.
  // explicitly pass boatId to the parameter recordId
  // publish a message with message context through BoatMC message channel with the recordId payload
  sendMessageService(boatId) {
    publish(this.messageContext, BoatMC, { recordId: boatId });
  }

  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values

  // call notifyloading function with true
  // map over the draftvalues, assign to recordInputs
  // method saves the changes in the Boat Editor
  // shows a toast message with the title
  // clears lightning-datatable draft values
  handleSave(event) {
    // notify loading
    this.notifyLoading(true);
    const recordInputs = event.detail.draftValues.slice().map((draft) => {
      const fields = Object.assign({}, draft);
      return { fields };
    });

    const updatedFields = event.detail.draftValues;

    // make a promise for each record with async updateRecord function
    // map over all recordInputs
    // then...batch execute promises?
    const promises = recordInputs.map((recordInput) =>
      updateRecord(recordInput)
    );
    Promise.all(promises)
      .then((res) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
          })
        );
        this.draftValues = [];
        return this.refresh();
      })
      .catch((error) => {
        this.error = error;
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: MESSAGE_CONTACT_ADMIN,
            variant: ERROR_VARIANT
          })
        );
        this.notifyLoading(false);
      })
      .finally(() => {
        this.draftValues = [];
      });
  }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // notifyloading function that dispatches whether or not the search is done loading or not
  notifyLoading(isLoading) {
    if (isLoading) {
      // if loading, the parent event onLoading will check for onLoading and onDoneLoading
      this.dispatchEvent(new CustomEvent("loading"));
    } else {
      this.dispatchEvent(CustomEvent("doneloading"));
    }
  }
}
