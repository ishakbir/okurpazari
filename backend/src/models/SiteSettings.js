/**
 * SiteSettings Model
 * Stores site-wide settings like slider config, site name, theme etc.
 * Uses key-value pairs stored as JSON
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SiteSettings = sequelize.define('SiteSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'setting_key',
      comment: 'Setting identifier (e.g. slider_items, site_name)'
    },
    value: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      field: 'setting_value',
      comment: 'JSON stringified value',
      get() {
        const rawValue = this.getDataValue('value');
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return rawValue;
        }
      },
      set(val) {
        this.setDataValue('value', typeof val === 'string' ? val : JSON.stringify(val));
      }
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'description'
    }
  }, {
    tableName: 'site_settings',
    timestamps: true,
    underscored: true
  });

  /**
   * Get a setting by key
   */
  SiteSettings.getSetting = async function(key, defaultValue = null) {
    const setting = await this.findOne({ where: { key } });
    return setting ? setting.value : defaultValue;
  };

  /**
   * Set a setting by key
   */
  SiteSettings.setSetting = async function(key, value, description = null) {
    const [setting, created] = await this.findOrCreate({
      where: { key },
      defaults: { value, description }
    });
    
    if (!created) {
      setting.value = value;
      if (description) setting.description = description;
      await setting.save();
    }
    
    return setting;
  };

  return SiteSettings;
};
