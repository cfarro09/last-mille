import { Badge, BadgeProps, Box, BoxProps, createStyles, IconButton, makeStyles, styled, Theme } from "@material-ui/core";
import { useSelector } from "hooks";
import { BellNotificationIcon } from "icons";
import { FC, useState } from "react";

const StyledBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': {
        color: 'white',
        right: 4,
        top: 4,
        backgroundColor: '#FF7301',
        border: `2px solid white`,
        padding: '0 4px',
    },
}));

const useNotificationMenuStyles = makeStyles((theme: Theme) =>
  createStyles({
        rootIcon: {
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
        },
        menu: {
            padding: theme.spacing(1),
            maxHeight: 410,
            fontSize: 12,
        },
        noNotificationContainer: {
            height: 90,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
    }),
);

const NotificationMenu: FC<BoxProps> = (boxProps) => {
    const classes = useNotificationMenuStyles();

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const resValidateToken = useSelector(state => state.login.validateToken);

    const open = Boolean(anchorEl);
    const notifications = resValidateToken.loading ? [] : resValidateToken.user?.notifications || [];
    const notificationCount = notifications.length;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (notificationCount === 0) return;
        setAnchorEl(event.currentTarget);
    };

    return (
        <Box {...boxProps}>
            <IconButton
                aria-label="bell-notification"
                aria-controls="notification-list-menu-popover"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <div className={classes.rootIcon}>
                    {notificationCount > 0 ?
                    (
                        <StyledBadge badgeContent={notificationCount} color="secondary">
                            <BellNotificationIcon />
                        </StyledBadge>
                    ) :
                    <BellNotificationIcon />}
                </div>
            </IconButton>
        </Box>
    );
};

export default NotificationMenu;
