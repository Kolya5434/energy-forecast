import { useTranslation } from 'react-i18next';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import CategoryIcon from '@mui/icons-material/Category';
import CodeIcon from '@mui/icons-material/Code';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import HubIcon from '@mui/icons-material/Hub';
import ScienceIcon from '@mui/icons-material/Science';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TocIcon from '@mui/icons-material/Toc';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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

        {/* Main Forecast Page */}
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
                  <ShowChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Прогноз')}
                  secondary={t(
                    'Вибір моделей, горизонту прогнозування та умов (погода, календар, час, енергетичні параметри). Інтерактивний графік з 12 типами візуалізації.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <HistoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Історичні дані')}
                  secondary={t(
                    'Графік реального споживання за вибраний період (7-365 днів) зі статистикою: мін, макс, середнє, медіана, стандартне відхилення.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CategoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Ознаки моделі')}
                  secondary={t(
                    'Детальна інформація про кожну модель: тип, гранулярність, набір ознак та опис кожної ознаки з поясненням її впливу на прогноз.'
                  )}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Evaluation */}
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

        {/* Feature Importance */}
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

        {/* Simulation */}
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
                    'Розширена форма з умовами: погодні (температура, вологість, вітер), календарні (свята, вихідні), часові (година, день, місяць), енергетичні та споживання по зонах.'
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

        {/* SHAP Force Plot */}
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

        {/* Analytics */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AnalyticsIcon color="primary" />
              <Typography variant="h6">{t('Аналітика')}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ mb: 2 }}>
              {t('Комплексний аналіз даних споживання енергії з різних точок зору для виявлення закономірностей та аномалій.')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Пікові періоди')}
                  secondary={t(
                    'Аналіз ранкових та вечірніх піків споживання, мінімального навантаження. Топ пікових та мінімальних значень за обраний період.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TimelineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Сезонні патерни')}
                  secondary={t(
                    'Візуалізація сезонності на різних рівнях гранулярності: погодинно, денно, тижнево, місячно, річно. Детальна статистика з графіками.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <WarningAmberIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Аномалії')}
                  secondary={t(
                    'Виявлення нетипового споживання з налаштованим порогом. Розподіл аномалій за годинами та днями тижня.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ShowChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Декомпозиція')}
                  secondary={t(
                    'Розкладання часового ряду на компоненти: тренд, сезонність, залишки. Метрики сили тренду та сезонності.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CompareArrowsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Порівняння сценаріїв')}
                  secondary={t(
                    'Створення та порівняння кількох сценаріїв прогнозування з різними умовами (тепла/холодна погода, свята тощо). Підсумкова таблиця з різницею від базового.'
                  )}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Scientific Analysis */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AssessmentIcon color="primary" />
              <Typography variant="h6">{t('Scientific Analysis')}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ mb: 2 }}>
              {t('Детальний науковий аналіз моделей прогнозування для публікацій та звітів.')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AssessmentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Статистичні тести')}
                  secondary={t(
                    'Порівняння моделей за допомогою статистичних тестів значущості: t-test, Wilcoxon, Mann-Whitney для визначення найкращої моделі.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TimelineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Аналіз залишків')}
                  secondary={t(
                    'Валідація припущень моделі: розподіл залишків, Q-Q plot, тест на нормальність, автокореляція.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BubbleChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Візуалізації')}
                  secondary={t(
                    'Генерація високоякісних наукових графіків для публікацій: порівняння моделей, розподіл помилок, correlation matrix.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Аналіз помилок')}
                  secondary={t(
                    'Детальний аналіз помилок прогнозування з часовими паттернами: по годинах, днях тижня, місяцях.'
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t('Експорт')}
                  secondary={t(
                    'Експорт результатів у LaTeX для наукових публікацій та звіт про відтворюваність з повним описом методології.'
                  )}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};
