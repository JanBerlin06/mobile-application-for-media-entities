/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    addNewMediaItemElement;

    /*
     * initialize view
     */
    async oncreate() {

        // TODO: do databinding, set listeners, initialize the view

        this.addNewMediaItemElement = this.root.querySelector("#myapp-addNewMediaItem");
        this.addNewMediaItemElement.onclick = () => {this.createNewItem();}

        // switch between local und remote
        this.root.querySelector("footer .mwf-img-refresh").onclick = () => {
            if(this.application.currentCRUDScope === "local"){
                this.application.switchCRUD("remote");
                this.root.querySelector("footer p").textContent = "REMOTE"
            } else {
                this.application.switchCRUD("local");
                this.root.querySelector("footer p").textContent = "LOCAL"
            }
            entities.MediaItem.readAll().then(items => this.initialiseListview(items));
        }

        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });
        
        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        if (nextviewid == "myapp-mediaReadview" && returnValue && returnValue.deletedItem && returnStatus == "itemDeleted") {
            this.removeFromListview(returnValue.deletedItem._id);
        }
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    /* bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
        itemview.root.querySelector("img").src = itemobj.src;
        itemview.root.querySelector("h2").textContent = itemobj.title;
        itemview.root.querySelector("h3").textContent = itemobj.added;
    } */

    /*
     *
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled   
        this.nextView("myapp-mediaReadview", {item: itemobj});
    }

    /*
     *
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
        super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /* 
     * delete dialog - are you sure?
     */
    deleteItem(item){
        this.showDialog("deleteDialog", {
            item: item,
            actionBindings: {
                confirmDelete: ((event) => {
                    event.original.preventDefault();
                    item.delete().then(() => {
                        this.removeFromListview(item._id);
                    });
                    this.hideDialog();
                }),
                closeDialog: ((event) => {
                    this.hideDialog();
                })
            }
        });
    }

    /* 
     * "edit"-menu
     */
    editItem(item){
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        this.updateInListview(item._id,item);
                    });
                    this.hideDialog();
                }),
                deleteItem: ((event) => {
                    this.deleteItem(item);
                })
            }
        });
    }

    /* 
     * create a new item
     */
    createNewItem() {

        // Random pic
        const srcoptions = ["https://picsum.photos/100/100", "https://picsum.photos/200/150", "https://picsum.photos/150/200"];
        let selectedSource = srcoptions[Date.now() % srcoptions.length];
        var newItem = new entities.MediaItem("", selectedSource);

        this.showDialog("mediaItemDialog",{
            item: newItem,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    newItem.create().then(() => {
                        this.addToListview(newItem);
                    });
                    this.hideDialog();
                })
            }
        });
    }
}
