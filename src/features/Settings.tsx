import { Box, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import DataSettings from "./DataSettings";
import ProcessingSettings from "./ProcessingSettings";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

export default function Settings() {
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "15em",
        height: "100%",
        background: "#eee",
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        <Tab label="Размеры" {...a11yProps(0)} />
        <Tab label="Обработка" {...a11yProps(1)} />
      </Tabs>

      <CustomTabPanel value={value} index={0}>
        <DataSettings></DataSettings>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <ProcessingSettings></ProcessingSettings>
      </CustomTabPanel>
    </Box>
  );
}
