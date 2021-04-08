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

export default class boatSearchResults extends LightningElement {
  // init some variables
  boatTypeId = "";
  //track boats + draftValues
  @track boats;
  @track draftValues = [];
  selectedBoatId = "";
  isLoading = false;
  error = undefined;
  wiredBoatsResult;

  // this returns a messageContext object from the message service that the component is subscribed to
  // When using the @wire(MessageContext) adapter, you don’t have to interact with any of the component’s lifecycle events.
  // The Lightning message service features automatically unregister when the component is destroyed.
  @wire(MessageContext)
  messageContext;

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

  // call the searchBoats function in the parent container + pass the boatTypeId as a param
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  // decorate the function getBoats with wire so it is called again each time the data changes
  //@wire(adapterId, adapterConfig)
  @wire(getBoats, { boatTypeId: "$boatTypeId" }) // why $boatTypeId?
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

  // onboatSelect (customEvent in boatTile)
  // update selected boatID and send as a message?
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // call notifyloading function with true
  // map over the draftvalues, assign to recordInputs

  handleSave(event) {
    this.notifyLoading(true);
    const recordInputs = event.detail.draftValues.slice().map((draft) => {
      const fields = Object.assign({}, draft); // ???
      return { fields };
    });

    // console.log(recordInputs);
    const promises = recordInputs.map((recordInput) =>
      updateRecord(recordInput)
    );
    // ??????????????
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
            message: CONST_ERROR,
            variant: ERROR_VARIANT
          })
        );
        this.notifyLoading(false);
      })
      .finally(() => {
        this.draftValues = [];
      });
  }

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

  // publish a message with message context through BoatMC message channel with the recordId payload
  sendMessageService(boatId) {
    publish(this.messageContext, BoatMC, { recordId: boatId });
  }
}
