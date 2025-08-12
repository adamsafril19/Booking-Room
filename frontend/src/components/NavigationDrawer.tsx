import React from "react";
import { Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Toolbar,
} from "@mui/material";
import {
  Dashboard,
  MeetingRoom,
  CalendarToday,
  Assessment,
} from "@mui/icons-material";

const NavigationDrawer: React.FC<{
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  drawerWidth: number;
}> = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const theme = useTheme();

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", sm: "none" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
      }}
    >
      <div>
        <Toolbar />
        <Divider />
        <List>
          <ListItem component={Link} to="/" onClick={handleDrawerToggle}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem component={Link} to="/rooms" onClick={handleDrawerToggle}>
            <ListItemIcon>
              <MeetingRoom />
            </ListItemIcon>
            <ListItemText primary="Ruangan" />
          </ListItem>
          <ListItem
            component={Link}
            to="/bookings"
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>
              <CalendarToday />
            </ListItemIcon>
            <ListItemText primary="Booking" />
          </ListItem>
          <ListItem component={Link} to="/reports" onClick={handleDrawerToggle}>
            <ListItemIcon>
              <Assessment />
            </ListItemIcon>
            <ListItemText primary="Laporan" />
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default NavigationDrawer;
