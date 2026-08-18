import { BiomassBuyer } from "../models/BiomassBuyer.js";

export const getBiomassBuyers = async (req, res, next) => {
  try {
    const { search, plantType } = req.query;
    const filter = {};

    if (plantType && plantType !== "ALL") {
      filter.plantType = new RegExp(plantType, "i");
    }

    if (search) {
      const reg = new RegExp(search, "i");
      filter.$or = [
        { name: reg },
        { buyerCode: reg },
        { division: reg },
        { contactPerson: reg },
        { gstin: reg },
      ];
    }

    const buyers = await BiomassBuyer.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: buyers });
  } catch (err) {
    next(err);
  }
};

export const getBiomassBuyerById = async (req, res, next) => {
  try {
    const buyer = await BiomassBuyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ success: false, message: "Buyer not found" });
    }
    res.json({ success: true, data: buyer });
  } catch (err) {
    next(err);
  }
};

export const createBiomassBuyer = async (req, res, next) => {
  try {
    const {
      name,
      division,
      address,
      gstin,
      plantType,
      agreedRatePerMt,
      targetQtyMt,
      contactPerson,
      contactMobile,
      email,
      poNo,
      paymentTerms,
    } = req.body;

    if (!name || !address || !gstin) {
      return res.status(400).json({ success: false, message: "Buyer name, address, and GSTIN are required" });
    }

    const buyer = new BiomassBuyer({
      name: name.toUpperCase(),
      division: division ? division.toUpperCase() : "",
      address,
      gstin: gstin.toUpperCase(),
      plantType: plantType || "Bio-Ethanol Plant",
      agreedRatePerMt: Number(agreedRatePerMt) || 1850,
      targetQtyMt: Number(targetQtyMt) || 5000,
      contactPerson,
      contactMobile,
      email,
      poNo,
      paymentTerms: paymentTerms || "Net 15 Days",
    });

    await buyer.save();
    res.status(201).json({ success: true, message: "Buyer created successfully", data: buyer });
  } catch (err) {
    next(err);
  }
};

export const updateBiomassBuyer = async (req, res, next) => {
  try {
    const buyer = await BiomassBuyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ success: false, message: "Buyer not found" });
    }

    Object.assign(buyer, req.body);
    if (req.body.name) buyer.name = req.body.name.toUpperCase();
    if (req.body.division) buyer.division = req.body.division.toUpperCase();
    if (req.body.gstin) buyer.gstin = req.body.gstin.toUpperCase();

    await buyer.save();
    res.json({ success: true, message: "Buyer updated successfully", data: buyer });
  } catch (err) {
    next(err);
  }
};

export const deleteBiomassBuyer = async (req, res, next) => {
  try {
    const buyer = await BiomassBuyer.findByIdAndDelete(req.params.id);
    if (!buyer) {
      return res.status(404).json({ success: false, message: "Buyer not found" });
    }
    res.json({ success: true, message: "Buyer deleted successfully" });
  } catch (err) {
    next(err);
  }
};
