import { useTranslation } from 'react-i18next';

import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HubIcon from '@mui/icons-material/Hub';
import ScienceIcon from '@mui/icons-material/Science';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TocIcon from '@mui/icons-material/Toc';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography
} from '@mui/material';

export const HelpContent = () => {
  const { t } = useTranslation();

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0, overflowY: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: '100%', backgroundColor: 'background.paper' }}>
        <Typography variant="h5">{t('Довідка та Опис Модулів')}</Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" sx={{ mb: 3 }}>
          {t(
            'Ця сторінка пояснює призначення та функціонал кожної вкладки вашої аналітичної платформи, як це показано на навігаційній панелі.'
          )}
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ShowChartIcon color="primary" />
              <Typography variant="h6">{t('Графік Прогнозів')}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {t('Це головний екран платформи, призначений для візуалізації та порівняння прогнозів моделей.')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Панель керування (зліва)')}
                  secondary={t(
                    "Дозволяє вибрати одну або декілька моделей зі списку (напр., 'XGBoost_Tuned', 'SARIMA'), вказати горизонт прогнозування та запустити розрахунок кнопкою 'Сформувати прогноз'."
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Основна область (центр)')}
                  secondary={t(
                    'Відображає інтерактивний графік, де кожна лінія відповідає прогнозу обраної моделі. Дозволяє візуально оцінити різницю між моделями.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Вибір типу графіка (справа)')}
                  secondary={t(
                    "Дозволяє миттєво перемикати візуалізацію між різними типами графіків, такими як 'Лінійна', 'Стовпчаста' або 'Area'."
                  )}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BarChartIcon color="primary" />
              <Typography variant="h6">{t('Порівняння (Evaluation)')}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {t(
                "Ця вкладка призначена для глибокого, об'єктивного аналізу та порівняння ефективності моделей за ключовими критеріями. Вона динамічно викликає ендпоінт `/api/evaluation/{model_id}`."
              )}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Таблиця метрик')}
                  secondary={t(
                    'Зведена таблиця з усіма ключовими метриками: точність (MAE, RMSE, R²), продуктивність (Latency, Memory). Дозволяє сортувати та підсвічує найкращі/найгірші значення.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Графік порівняння')}
                  secondary={t(
                    'Візуалізує ті ж метрики у вигляді стовпчастої, лінійної або area-діаграми для наочного порівняння.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <HubIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Аналіз помилок')}
                  secondary={t(
                    "Дозволяє візуально оцінити, де і як помиляється ОДНА вибрана модель: графік залишків у часі, розподіл помилок по місяцях (Box Plot) та графік 'Факт vs Прогноз'."
                  )}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HubIcon color="primary" />
              <Typography variant="h6">{t('Аналіз важливості ознак')}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {t(
                'Ця вкладка відповідає на питання: "Чому ML-модель зробила такий прогноз?". Вона викликає `GET /api/interpret/{model_id}`.'
              )}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Графік важливості ознак')}
                  secondary={t(
                    "Показує, які вхідні дані (наприклад, 'day_of_week' або 'Sub_metering_3') мали найбільший вплив на результат роботи моделі. Дозволяє вибрати модель та кількість ознак (Топ-N)."
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Таблиця важливості')}
                  secondary={t(
                    'Дозволяє переглянути ті ж дані у вигляді таблиці та експортувати їх у XLSX, PDF або DOCX.'
                  )}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ScienceIcon color="primary" />
              <Typography variant="h6">{t('Симуляція (What-If)')}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {t(
                '"Вау-фіча", що демонструє практичну цінність моделі. Вона дозволяє вам "гратися" з майбутніми даними, викликаючи `POST /api/simulate`.'
              )}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Форма керування')}
                  secondary={t(
                    "Дозволяє вибрати модель, горизонт прогнозування та вручну змінити одну з ознак для конкретної дати (напр., змінити 'day_of_week' на '6' для симуляції свята)."
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Графік симуляції')}
                  secondary={t(
                    "Відображає дві лінії: 'Базовий прогноз' (що було б без змін) та 'Симульований прогноз' (що сталося після змін). Це наочно показує, як модель реагує на зміну вхідних факторів."
                  )}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HubIcon color="primary" />
              <Typography variant="h6">{t('Візуалізація SHAP Force Plot')}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {t('Найглибший рівень аналізу, який пояснює **один конкретний прогноз**. Він показує:')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Базове значення (Base Value)')}
                  secondary={t('Середній прогноз моделі по всіх даних.')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Внески ознак (Feature Contributions)')}
                  secondary={t(
                    "Червоні та сині стрілки показують, які саме ознаки (напр., 'day_of_week') 'штовхали' прогноз вгору (підвищували споживання) або вниз (знижували) відносно базового значення."
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Фінальний прогноз (Prediction)')}
                  secondary={t('Результат, що дорівнює сумі базового значення та всіх внесків.')}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};
