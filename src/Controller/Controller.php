<?php

namespace App\Controller;

use App\Entity\Filter;
use App\Repository\FiltersRepository;
use App\Repository\FilterSubtypesRepository;
use App\Repository\FilterTypesRepository;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class Controller extends AbstractController
{
    private FilterTypesRepository $filterTypesRepository;
    private FiltersRepository $filtersRepository;
    private FilterSubtypesRepository $filterSubTypesRepository;

    protected $connection;

    public function __construct(FiltersRepository $filtersRepository, FilterTypesRepository $filterTypesRepository, FilterSubtypesRepository $filterSubTypesRepository, Connection $connection)
    {
        $this->filtersRepository = $filtersRepository;
        $this->filterTypesRepository = $filterTypesRepository;
        $this->filterSubTypesRepository = $filterSubTypesRepository;
        $this->connection = $connection;
    }

    #[Route('/api/list/{listName}', name: 'api_list')]
    public function loadList(string $listName, EntityManagerInterface $entityManager): Response
    {
        $templateMap = [
            'filters' => 'MainBundle/filters.html.twig',
            'list1' => 'MainBundle/filter_types.html.twig',
            'list2' => 'MainBundle/filter_types.html.twig',
        ];

        if (!array_key_exists($listName, $templateMap)) {
            return new Response('List not found', 404);
        }

        // Load limited data
        $repository = $entityManager->getRepository(Filter::class);
        $filtersRepository = $this->filtersRepository;
        $filters = $repository->findAll();

        $filterEntities = $filtersRepository->findAll();
        $filters = [];
        foreach ($filterEntities as $filter) {
            $criteria = [];
            foreach ($filter->getCriteria() as $criterion) {
                $type = $criterion->getType()->getName();
                $subtype = $criterion->getSubtype()->getName();
                $value = $criterion->getValue();
                if (!is_numeric($value)) {
                    $value = "'$value'";
                }
                $criteria[] = "$type $subtype $value";
            }

            $criteria = implode(', ', $criteria);
            $filters[] = [
                'id' => $filter->getId(),
                'name' => $filter->getName(),
                'entity' => $filter,
                'criteria' => $criteria
            ];
        }

        return $this->render($templateMap[$listName], [
            'items' => $filters
        ]);
    }

    #[Route('//', name: 'app__')]
    public function index(): Response
    {
        $filtersRepository = $this->filtersRepository;
        $filterTypesRepository = $this->filterTypesRepository;
        $filterSubTypesRepository = $this->filterSubTypesRepository;

        $filterEntities = $filtersRepository->findAll();
        $filters = [];
        foreach ($filterEntities as $filter) {
            $criteria = [];
            foreach ($filter->getCriteria() as $criterion) {
                $type = $criterion->getType()->getName();
                $subtype = $criterion->getSubtype()->getName();
                $value = $criterion->getValue();
                if (!is_numeric($value)) {
                    $value = "'$value'";
                }
                $criteria[] = "$type $subtype $value";
            }

            $criteria = implode(', ', $criteria);
            $filters[] = [
                'id' => $filter->getId(),
                'name' => $filter->getName(),
                'entity' => $filter,
                'criteria' => $criteria
            ];
        }

        $data = [
            'filters' => $filters
        ];


        return $this->render('MainBundle/filters.html.twig', $data);
    }

    #[Route('/types', name: 'types', methods: ['GET'])]
    public function indexTypes(): JsonResponse
    {
        $filterTypesRepository = $this->filterTypesRepository;
        $filterTypesEntities = $filterTypesRepository->findAll();
        $data = [
            'filters' => $filterTypesEntities
        ];
        dump($data);

        return $this->render('MainBundle/filter_types.html.twig', $data);
    }
    #[Route('/api/filters', name: 'api_filters', methods: ['GET'])]
    public function getFilters(): JsonResponse
    {
        $filters = $this->filtersRepository->findAll();
        return $this->json($filters);
    }

    #[Route('/modal', name: 'app_modal')]
    public function modal(): Response
    {
        return $this->render('modal.html.twig', [
            'title' => 'Dynamic Modal Title',
            'content' => 'This is dynamic content from the controller'
        ]);
    }
}
