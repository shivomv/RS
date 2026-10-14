const Company = require('./company.model');

// Get company details (public endpoint for buyer app)
exports.getCompanyDetails = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    
    if (!company) {
      // Create default company if doesn't exist
      company = await Company.create({});
    }

    res.json({
      success: true,
      data: company,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

// Update company details (admin only)
exports.updateCompanyDetails = async (req, res, next) => {
  try {
    const updateData = req.body;
    
    let company = await Company.findOne();
    
    if (!company) {
      // Create if doesn't exist
      company = await Company.create(updateData);
    } else {
      // Update existing
      Object.assign(company, updateData);
      company.updatedAt = new Date();
      await company.save();
    }

    res.json({
      success: true,
      message: 'Company details updated successfully',
      data: company,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};

// Get company details for admin
exports.getCompanyForAdmin = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    
    if (!company) {
      company = await Company.create({});
    }

    res.json({
      success: true,
      data: company,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
};
