import { BiomassVendor } from "../models/BiomassVendor.js";

export const getBiomassVendors = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      const reg = new RegExp(search, "i");
      filter.$or = [
        { companyName: reg },
        { vendorCode: reg },
        { representative: reg },
        { gstin: reg },
        { sourcingArea: reg },
      ];
    }

    const vendors = await BiomassVendor.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (err) {
    next(err);
  }
};

export const getBiomassVendorById = async (req, res, next) => {
  try {
    const vendor = await BiomassVendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    res.json({ success: true, data: vendor });
  } catch (err) {
    next(err);
  }
};

export const createBiomassVendor = async (req, res, next) => {
  try {
    const {
      companyName,
      gstin,
      panNo,
      representative,
      contactNo,
      email,
      address,
      sourcingArea,
      poNo,
      poDate,
      tenure,
      contractedQtyMt,
      agreedPricePerMt,
      bankName,
      accountNo,
      ifscCode,
    } = req.body;

    if (!companyName || !contactNo) {
      return res.status(400).json({ success: false, message: "Company name and contact number are required" });
    }

    const vendor = new BiomassVendor({
      companyName: companyName.toUpperCase(),
      gstin: gstin ? gstin.toUpperCase() : "",
      panNo: panNo ? panNo.toUpperCase() : "",
      representative,
      contactNo,
      email,
      address,
      sourcingArea: sourcingArea || "Unnao & Surrounding Villages",
      poNo,
      poDate,
      tenure,
      contractedQtyMt: Number(contractedQtyMt) || 1000,
      agreedPricePerMt: Number(agreedPricePerMt) || 1400,
      bankName,
      accountNo,
      ifscCode,
    });

    await vendor.save();
    res.status(201).json({ success: true, message: "Vendor created successfully", data: vendor });
  } catch (err) {
    next(err);
  }
};

export const updateBiomassVendor = async (req, res, next) => {
  try {
    const vendor = await BiomassVendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    Object.assign(vendor, req.body);
    if (req.body.companyName) vendor.companyName = req.body.companyName.toUpperCase();
    if (req.body.gstin) vendor.gstin = req.body.gstin.toUpperCase();

    await vendor.save();
    res.json({ success: true, message: "Vendor updated successfully", data: vendor });
  } catch (err) {
    next(err);
  }
};

export const deleteBiomassVendor = async (req, res, next) => {
  try {
    const vendor = await BiomassVendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    res.json({ success: true, message: "Vendor deleted successfully" });
  } catch (err) {
    next(err);
  }
};
