const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("Public"));

mongoose.connect("mongodb+srv://riteshsonawane622:ritesh4979@cluster0.vcbc8d0.mongodb.net/todolistDB", {useNewUrlParser: true})

const itemsSchema = {
    name: String
}
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your to do list!"
});
const item2 = new Item({
    name: "Hit the + button to add the item"
});
const item3 = new Item({
    name: "<-- Hit this to delete item"
});

const defaultItems = [item1, item2, item3];

// Insert Many function

const listSchema = {
    name: String,
    items: [itemsSchema]
} 

const List = mongoose.model("List", listSchema)



app.get("/", function(req, res){

Item.find().then(docs =>{
    if(docs.length === 0){
        Item.insertMany(defaultItems)
        .then(docs => {
        console.log("Successfully saved default items to DB.");
        })
        .catch(error => {
    console.error(error);
  });
     res.redirect("/")
        
    }else{
        res.render("list",{listTitle: 'Today', newListItems:docs});

    }
   
});

app.get("/:customListName", function(req, res){
    
    const customLIstName = _.capitalize(req.params.customListName);

    List.findOne({ name: customLIstName })
    .then(list => {
        if (!list) {
            // Create a new list
            const list = new List({
                name: customLIstName,
                items: defaultItems
            });
            list.save()
            res.redirect("/" + list.name);
            return;
        }
        //Show existing list
        res.render("list", {listTitle: list.name, newListItems: list.items})
    })
    .catch(error => {
        console.log(error);
    });

   
});

    
});
app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list

    const item = new Item({
        name: itemName
    })
  
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    
    }else{
        List.findOne({name: listName}).then(foundList => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
            
        });

    }
 
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(docs => {
        
        }).catch(err => {
            console.log(err);
        })
        res.redirect("/")

    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(list => {
          
        }).catch(err => {
            console.log(err);
        })
        res.redirect("/" + listName);
    }

   

})



app.listen(process.env.PORT || 3000, function(req, res){
    console.log("Server has been started");
});
