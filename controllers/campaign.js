const db = require("../models");

const item1 = new db.Campaign({
  title: "test1",
  subTitle: "subTitle1",
  description: "test1 description here...",
  imageUrl:
    "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
  required: 500,
  start: "2020-12-22T11:18:54.919Z",
});

const item2 = new db.Campaign({
  title: "test2",
  subTitle: "subTitle2",
  description: "test2 description here...",
  imageUrl:
    "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
  required: 100,
  start: "2020-12-20T11:18:54.919Z",
});

const item3 = new db.Campaign({
  title: "test3",
  subTitle: "subTitle3",
  description: "test3 description here...",
  imageUrl:
    "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
  required: 5000,
  start: "2020-12-19T11:18:54.919Z",
});

const item4 = new db.Campaign({
  title: "test4",
  subTitle: "subTitle4",
  description: "test4 description here...",
  imageUrl:
    "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
  required: 50000,
  start: "2020-12-22T11:19:54.919Z",
});

const defaultItems = [item1, item2, item3, item4];

db.Campaign.find().exec((err, results) => {
  if (results.length === 0) {
    db.Campaign.insertMany(defaultItems, (err) => {
      if (err) {
        console.error("Error inserting default items:", err);
      } else {
        console.log(
          "Successfully added default items to Campaign collection in DB"
        );
      }
    });
  }
});

function hideTransactionID(donors) {
  if (!donors || donors.length === 0) return;

  for (let i = 0; i < donors.length; i++) {
    let S = donors[i].transactionID;
    let hiddenID = S.slice(0, 4) + "XXXX" + S.slice(-3);
    donors[i].transactionID = hiddenID;
  }
}

const show = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Invalid Campaign ID format" });
    }

    const campaign = await db.Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    hideTransactionID(campaign.donors);
    return res.status(200).json(campaign);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the campaign" });
  }
};

const showAll = async (req, res) => {
  try {
    const campaigns = await db.Campaign.find({}).sort({ start: -1 });

    campaigns.forEach((campaign) => {
      hideTransactionID(campaign.donors);
    });

    return res.status(200).json(campaigns);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching campaigns" });
  }
};

const createCampaign = async (req, res) => {
  try {
    const { title, subTitle, description, imageUrl, required, start } =
      req.body;

    const newCampaign = new db.Campaign({
      title,
      subTitle,
      description,
      imageUrl,
      required,
      start,
    });

    await newCampaign.save();
    return res.status(201).json(newCampaign);
  } catch (error) {
    return res.status(500).json({ message: "Error creating campaign" });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCampaign = await db.Campaign.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json(updatedCampaign);
  } catch (error) {
    return res.status(500).json({ message: "Error updating campaign" });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCampaign = await db.Campaign.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting campaign" });
  }
};

const filterByAmount = async (req, res) => {
  try {
    const { minAmount } = req.query;
    const campaigns = await db.Campaign.find({ required: { $gte: minAmount } });

    return res.status(200).json(campaigns);
  } catch (error) {
    return res.status(500).json({ message: "Error filtering campaigns" });
  }
};

module.exports = {
  show,
  showAll,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  filterByAmount,
};
