import * as queries 				    					from '../cache/queries';

export class jsTPS_Transaction {
    constructor() {};
    doTransaction() {};
    undoTransaction () {};
}
/*  Handles list name changes, or any other top level details of a todolist that may be added   */
export class UpdateListField_Transaction extends jsTPS_Transaction {
    constructor(_id, field, prev, update, callback) {
        super();
        this.prev = prev;
        this.update = update;
        this.field = field;
        this._id = _id;
        this.updateFunction = callback;
    }
    async doTransaction() {
		const { data } = await this.updateFunction({ variables: { _id: this._id, field: this.field, value: this.update }});
		return data;
    }
    async undoTransaction() {
        const { data } = await this.updateFunction({ variables: { _id: this._id, field: this.field, value: this.prev }});
		return data;
    }
}


/*  Handles item reordering */
/*
export class ReorderItems_Transaction extends jsTPS_Transaction {
    constructor(listID, itemID, dir, callback) {
        super();
        this.listID = listID;
        this.itemID = itemID;
		this.dir = dir;
		this.revDir = dir === 1 ? -1 : 1;
		this.updateFunction = callback;
	}

    async doTransaction() {
		const { data } = await this.updateFunction({ variables: { itemId: this.itemID, _id: this.listID, direction: this.dir }});
		return data;
    }

    async undoTransaction() {
		const {data} = await this.updateFunction({ variables: { itemId: this.itemID, _id: this.listID, direction: this.revDir }});
		return data;

    }
}*/

export class EditRegion_Transaction extends jsTPS_Transaction {
	constructor(regionId, field, prev, update, callback) {
		super();
		//this.listID = listID;
		this.regionId = regionId;
		this.field = field;
		this.prev = prev;
		this.update = update;
		//this.flag = flag;
		this.updateFunction = callback;
	}	

	async doTransaction() {
        console.log("REGIONID FROM REDO: " + this.regionId);
		const { data } = await this.updateFunction({variables:{ regionId: this.regionId, field: this.field, value: this.update}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
		return data;
    }

    async undoTransaction() {
		const { data } = await this.updateFunction({variables:{ regionId: this.regionId, field: this.field, value: this.prev}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
		return data;
    }
}

/*  Handles create/delete of region items */
export class UpdateSpreadsheetItems_Transaction extends jsTPS_Transaction {
    // opcodes: 0 - delete, 1 - add 
    constructor(parentID, regionID, region, opcode, addfunc, delfunc, index = -1) {
        super();
        this.parentID = parentID;
		this.regionID = regionID;
		this.region = region;
        this.addFunction = addfunc;
        this.deleteFunction = delfunc;
        this.opcode = opcode;
	    this.index = index
    }

    
    async doTransaction() {
        console.log("READD" + this.regionID);
		let data;
        console.log(this.region);
        this.opcode === 0 ? { data } = await this.deleteFunction({
							variables: {parentId: this.parentID, regionId: this.regionID}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]})
						  : { data } = await this.addFunction({
							variables: {region: this.region, _id: this.parentID, index: this.index}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]})  
		if(this.opcode !== 0) {
            console.log(data.addRegion);
            /*this.region._id =*/ this.regionID = data.addRegion;
		}
        //console.log(this.region); 
		return data;
    }
    // Since delete/add are opposites, flip matching opcode
    async undoTransaction() {
        console.log(this.parentID);
        console.log("UNDO DELETE ID HERE: " + this.regionID); //this regionID is correct
        let fixedLandmarks = [];
        for(let l = 0; l < this.region.landmarks.length; l++){ //this is to remove the typeName property of the landmarks so mongo can recognize as LandmarkInput
            let fixedLandmark = {
                _id: this.region.landmarks[l]._id,
                id: this.region.landmarks[l].id,
                name: this.region.landmarks[l].name,
                ownerRegion: this.region.landmarks[l].ownerRegion,
            }
            fixedLandmarks.push(fixedLandmark);
        }

        let regionToReadd = {
            _id: this.regionID, //can't use this.region._id because at the time of adding the region, it wasn't given an _id yet
			id: this.region.id,
			name: this.region.name,
			capital: this.region.capital,
			leader: this.region.leader,
            flag: this.region.flag,
            landmarks: fixedLandmarks,
            position: this.region.position,
            parent: this.region.parent,
            subregions: this.region.subregions,
            path: this.region.path,
			owner: this.region.owner,
        }
        console.log(regionToReadd._id); //why is the mutation still generating a new _id?
		let data;
        this.opcode === 1 ? { data } = await this.deleteFunction({
							variables: {parentId: this.parentID, regionId: this.regionID}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]})
                          : { data } = await this.addFunction({
							variables: {region: regionToReadd/*this.region*/, _id: this.parentID, index: this.index}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]})
        //console.log("THIS IS MY REGION: " + data);
		if(this.opcode !== 1) {
            /*this.region._id =*/ this.regionID = data.addRegion;
        }
        else{
            this.region = regionToReadd;
        }
		return data;
    }
}

export class SortByColumn_Transaction extends jsTPS_Transaction {
    constructor(parentId, prevSubregionsArr, sortFunction, revertFunction, sortCode) {
        super();
        this.parentID = parentId;
        this.prev = prevSubregionsArr;
        this.sortingFunction = sortFunction;
        this.revertingFunction = revertFunction;
        this.sortCode = sortCode;
    }

    async doTransaction() {
        console.log(this.parentID);
        const { data } = await this.sortingFunction({ variables: {parentId: this.parentID, sortCode: this.sortCode}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
        return data;
    }

    async undoTransaction() {
        const { data } = await this.revertingFunction({ variables: {parentId: this.parentID, prevConfig: this.prev, sortCode: this.sortCode}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
        return data;
    }
}

export class AddDeleteLandmark_Transaction extends jsTPS_Transaction {
    constructor(parentId, activeMapId, landmark, opcode, addFunction, deleteFunction, index = -1){
        super();
        this.parentId = parentId;
        this.activeMapId = activeMapId;
        this.landmark = landmark;
        this.opcode = opcode;
        this.addFunction = addFunction;
        this.deleteFunction = deleteFunction;
        this.landmarkToDeleteId = landmark._id;
        this.index = index;

        console.log(parentId);
        console.log(activeMapId);
        console.log(landmark);
    }

    async doTransaction() {
        console.log(this.parentId);
        console.log(this.activeMapId);
        console.log(this.landmarkToDeleteId);
        console.log(this.opcode);
        let data;
        this.opcode === 1 ? { data } = await this.addFunction({ 
                            variables: { parentId: this.parentId, activeMapId: this.activeMapId, landmark: this.landmark }, refetchQueries: [{ query: queries.GET_DB_REGIONS }]})
                          : { data } = await this.deleteFunction({variables: {parentId: this.parentId, activeMapId: this.activeMapId, landmarkToDeleteId: this.landmarkToDeleteId}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
        if(this.opcode === 1){
            this.landmarkToDeleteId = data.addLandmark;
        }
        return data;
    }

    async undoTransaction() {
        console.log(this.parentId);
        console.log(this.activeMapId);
        console.log(this.landmarkToDeleteId);
        console.log(this.opcode);
        let landmarkToReAdd = {
            _id: this.landmark._id,
            id: this.landmark.id,
            name: this.landmark.name,
            ownerRegion: this.landmark.ownerRegion,
        }
        let data;
        this.opcode === 1 ?  ({ data } = await this.deleteFunction({variables: {parentId: this.parentId, activeMapId: this.activeMapId, landmarkToDeleteId: this.landmarkToDeleteId}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]}))
                          : ({ data } = await this.addFunction({variables: {parentId: this.parentId, activeMapId: this.activeMapId, landmark: landmarkToReAdd}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]}));
        if(this.opcode === 0){
            this.landmarkToDeleteId = data.addLandmark;
        }/*
        else if(this.opcode === 0){
            this.landmark = 
        }*/
        return data;
    }
}

export class EditLandmark_Transaction extends jsTPS_Transaction {
    constructor(landmarkID, parentID, activeMapId, newName, prevName, editingFunction){
        super();
        this.landmarkID = landmarkID;
        this.parentID = parentID;
        this.activeMapId = activeMapId;
        this.newName = newName;
        this.prevName = prevName;
        this.editingFunction = editingFunction;
    }

    async doTransaction() {
        let data = await this.editingFunction({variables: {landmarkID: this.landmarkID, parentID: this.parentID, activeMapId: this.activeMapId, name: this.newName}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
        return data;
    }

    async undoTransaction() {
        let data = await this.editingFunction({variables: {landmarkID: this.landmarkID, parentID: this.parentID, activeMapId: this.activeMapId, name: this.prevName}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
        return data;
    }
}

export class ChangeParent_Transaction extends jsTPS_Transaction {
    constructor(regionID, parentID, newParentName, prevParentName, changeParentFunction) {
        super();
        this.regionID = regionID;
        this.parentID = parentID;
        this.newParentName = newParentName;
        this.prevParentName = prevParentName;
        this.changeParentFunction = changeParentFunction;
    }

    async doTransaction() {
        let data = await this.changeParentFunction({ variables: {regionID: this.regionID, parentID: this.parentID, newParent: this.newParentName}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
        return data;
    }

    async undoTransaction() {
        let data = await this.changeParentFunction({ variables: {regionID: this.regionID, parentID: this.parentID, newParent: this.prevParentName}, refetchQueries: [{ query: queries.GET_DB_REGIONS }]});
        return data;
    }
}



export class jsTPS {
    constructor() {
        // THE TRANSACTION STACK
        this.transactions = [];
        // KEEPS TRACK OF WHERE WE ARE IN THE STACK, THUS AFFECTING WHAT
        // TRANSACTION MAY BE DONE OR UNDONE AT ANY GIVEN TIME
        this.mostRecentTransaction = -1;
        // THESE VARIABLES CAN BE TURNED ON AND OFF TO SIGNAL THAT
        // DO AND UNDO OPERATIONS ARE BEING PERFORMED
        this.performingDo = false;
        this.performingUndo = false;
    }
    
    /**
     * Tests to see if the do (i.e. redo) operation is currently being
     * performed. If it is, true is returned, if not, false.
     * 
     * return true if the do (i.e. redo) operation is currently in the
     * process of executing, false otherwise.
     */
    isPerformingDo() {
        return this.performingDo;
    }
    
    /**
     * Tests to see if the undo operation is currently being
     * performed. If it is, true is returned, if not, false.
     * 
     * return true if the undo operation is currently in the
     * process of executing, false otherwise.
     */
    isPerformingUndo() {
        return this.performingUndo;
    }
    
    /**
     * This function adds the transaction argument to the top of
     * the transaction processing system stack and then executes it. Note that it does
     * When this method has completed transaction will be at the top 
     * of the stack, it will have been completed, and the counter have
     * been moved accordingly.
     * 
     * param transaction The custom transaction to be added to
     * the transaction processing system stack and executed.
     */
    addTransaction(transaction) {
        // ARE THERE OLD UNDONE TRANSACTIONS ON THE STACK THAT FIRST
        // NEED TO BE CLEARED OUT, i.e. ARE WE BRANCHING?
        if ((this.mostRecentTransaction < 0)|| (this.mostRecentTransaction < (this.transactions.length-1))) {
            for (let i = this.transactions.length-1; i > this.mostRecentTransaction; i--) {
                this.transactions.splice(i, 1);
            }
        }

        // AND NOW ADD THE TRANSACTION
        this.transactions.push(transaction);
        // AND EXECUTE IT
        // this.doTransaction();        
    }

    /**
     * This function executes the transaction at the location of the counter,
     * then moving the TPS counter. Note that this may be the transaction
     * at the top of the TPS stack or somewhere in the middle (i.e. a redo).
     */
     async doTransaction() {
		let retVal;
        if (this.hasTransactionToRedo()) {   
            this.performingDo = true;
            let transaction = this.transactions[this.mostRecentTransaction+1];
			retVal = await transaction.doTransaction();
			this.mostRecentTransaction++;
			this.performingDo = false;
            
        }
        console.log('transactions: ' + this.getSize());
        console.log('redo transactions:' + this.getRedoSize());
        console.log('undo transactions:' + this.getUndoSize());
		console.log(' ')
		return retVal;
    }
    
    /**
     * This function checks to see if there is a transaction to undo. If there
     * is it will return it, if not, it will return null.
     * 
     * return The transaction that would be executed if undo is performed, if
     * there is no transaction to undo, null is returned.
     */
    peekUndo() {
        if (this.hasTransactionToUndo()) {
            return this.transactions[this.mostRecentTransaction];
        }
        else
            return null;
    }
    
    /**
     * This function checks to see if there is a transaction to redo. If there
     * is it will return it, if not, it will return null.
     * 
     * return The transaction that would be executed if redo is performed, if
     * there is no transaction to undo, null is returned.
     */    
    peekDo() {
        if (this.hasTransactionToRedo()) {
            return this.transactions[this.mostRecentTransaction+1];
        }
        else
            return null;
    }

    /**
     * This function gets the most recently executed transaction on the 
     * TPS stack and undoes it, moving the TPS counter accordingly.
     */
     async undoTransaction() {
		let retVal;
        if (this.hasTransactionToUndo()) {
            this.performingUndo = true;
            let transaction = this.transactions[this.mostRecentTransaction];
			retVal = await transaction.undoTransaction();
            this.mostRecentTransaction--;
			this.performingUndo = false;
        }
        console.log('transactions: ' + this.getSize());
        console.log('redo transactions:' + this.getRedoSize());
        console.log('undo transactions:' + this.getUndoSize());
        console.log(' ')
		return(retVal);
    }

    /**
     * This method clears all transactions from the TPS stack
     * and resets the counter that keeps track of the location
     * of the top of the stack.
     */
    clearAllTransactions() {
        // REMOVE ALL THE TRANSACTIONS
        this.transactions = [];
        
        // MAKE SURE TO RESET THE LOCATION OF THE
        // TOP OF THE TPS STACK TOO
        this.mostRecentTransaction = -1;        
    }
    
    /**
     * Accessor method that returns the number of transactions currently
     * on the transaction stack. This includes those that may have been
     * done, undone, and redone.
     * 
     * return The number of transactions currently in the transaction stack.
     */
    getSize() {
        return this.transactions.length;
    }
    
    /**
     * This method returns the number of transactions currently in the
     * transaction stack that can be redone, meaning they have been added
     * and done, and then undone.
     * 
     * return The number of transactions in the stack that can be redone.
     */
    getRedoSize() {
        return this.getSize() - this.mostRecentTransaction - 1;
    }

    /**
     * This method returns the number of transactions currently in the 
     * transaction stack that can be undone.
     * 
     * return The number of transactions in the transaction stack that
     * can be undone.
     */
    getUndoSize() {
        return this.mostRecentTransaction + 1;
    }
    
    /**
     * This method tests to see if there is a transaction on the stack that
     * can be undone at the time this function is called.
     * 
     * return true if an undo operation is possible, false otherwise.
     */
    hasTransactionToUndo() {
        return this.mostRecentTransaction >= 0;
    }
    
    /**
     * This method tests to see if there is a transaction on the stack that
     * can be redone at the time this function is called.
     * 
     * return true if a redo operation is possible, false otherwise.
     */
    hasTransactionToRedo() {
        return this.mostRecentTransaction < (this.transactions.length-1);
    }
        
    /**
     * This method builds and returns a textual summary of the current
     * Transaction Processing System, this includes the toString of
     * each transaction in the stack.
     * 
     * return A textual summary of the TPS.
     */
    // toString() {
    //     let text = "<br>" +"--Number of Transactions: " + this.transactions.length + "</br>";
    //     text += "<br>" + "--Current Index on Stack: " + this.mostRecentTransaction + "</br>";
    //     text += "<br>" + "--Current Transaction Stack:" + "</br>";
    //     for (let i = 0; i <= this.mostRecentTransaction; i++) {
    //         let jsT = this.transactions[i];
    //         text += "<br>" + "----" + jsT.toString() + "</br>";
    //     }
    //     return text;
    // }
}
